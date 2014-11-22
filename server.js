#!/usr/bin/env node

var http = require('http');
var express = require('express');
var WebSocketServer = require('websocket').server;

var app = express();
app.use(express.static(__dirname + '/public'));
var server = app.listen(7777);

var ws = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

var waiting_player = null;

function GameSession(p1, p2) {
    this.p1 = p1;
    this.p2 = p2;

    this._p1_state = {height: 0, max_knots: 0, win: false};
    this._p2_state = {height: 0, max_knots: 0, win: false};
    this._active_player = p1;
    this._rope_length = 5 + Math.floor(Math.random() * 6);
}

GameSession.prototype.get_params = function() {
    return {rope_length: this._rope_length};
};

GameSession.prototype.get_state = function() {
    var p1_state = {
        self: this._p1_state,
        other: this._p2_state,
        your_turn: this._active_player == this.p1,
    };
    var p2_state = {
        self: this._p2_state,
        other: this._p1_state,
        your_turn: this._active_player == this.p2,
    };

    return [p1_state, p2_state];
};

GameSession.prototype.make_move = function(p, move) {
    var state;
    if (p != this._active_player) {
        return;
    }

    if (p == this.p1) {
        state = this._p1_state;
        this._active_player = this.p2;
    } else if (p == this.p2) {
        state = this._p2_state;
        this._active_player = this.p1;
    } else {
        // TODO handle
    }

    if (move == 'tie') {
        state.max_knots = state.height;
    } else if (move == 'climb') {
        var success = Math.floor(Math.random() * 2);
        if (success) {
            state.height++;
            if (state.height >= this._rope_length) {
                state.win = true;
            }
        } else {
            state.height = state.max_knots;
        }
    } else {
        // TODO handle
    }
};

function on_player_join(req) {
    // TODO proper origin
    var player1 = req.accept('knots', req.origin);

    if (waiting_player) {
        var player2 = waiting_player;
        waiting_player.removeListener('close', on_player_close_before_game);
        waiting_player = null;

        start_game(player1, player2);
    } else {
        waiting_player = player1;
        waiting_player.on('close', on_player_close_before_game);
    }
}

function on_player_close_before_game() {
    if (this === waiting_player) {
        waiting_player = null;
    }
}

function start_game(p1, p2) {
    // TODO randomize order
    var session = new GameSession(p1, p2);
    p1.session = session;
    p2.session = session;

    p1.on('message', on_message.bind(p1));
    p2.on('message', on_message.bind(p2));
    p1.on('close', on_player_close);
    p2.on('close', on_player_close);

    send_game_start(session);
    update_states(session);
}

function on_message(e) {
    var session = this.session;
    session.make_move(this, e.utf8Data);
    update_states(session);
    // TODO send a specific win message and drop connection
}

function on_player_close() {
    var session = this.session,
        other_player = (this === session.p1) ? session.p2 : session.p1;

    other_player.sendUTF(JSON.stringify({other_disconnected: true}));
    other_player.removeListener('close', on_player_close);
    other_player.close();
}

function send_game_start(session) {
    var game_start = {
        game_start: session.get_params()
    };
    session.p1.sendUTF(JSON.stringify(game_start));
    session.p2.sendUTF(JSON.stringify(game_start));
}

function update_states(session) {
    var states = session.get_state();
    session.p1.sendUTF(JSON.stringify({state: states[0]}));
    session.p2.sendUTF(JSON.stringify({state: states[1]}));
}

ws.on('request', function(req) {
    if (false) {
    } else if (req.resourceURL.pathname == '/player') {
        on_player_join(req);
    } else {
        req.reject(404, 'Endpoint not found');
    }
});
