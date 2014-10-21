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

GameSession.prototype.getState = function() {
    var p1_state = {
        self: this._p1_state,
        other: this._p2_state,
        your_turn: this._active_player == this.p1,
        rope_height: this._rope_length
    };
    var p2_state = {
        self: this._p2_state,
        other: this._p1_state,
        your_turn: this._active_player == this.p2,
        rope_height: this._rope_length
    };

    return [p1_state, p2_state];
};

GameSession.prototype.makeMove = function(p, move) {
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

function onPlayerJoin(req) {
    // TODO proper origin
    var player1 = req.accept('knots', req.origin);
    // TODO handle close

    if (waiting_player) {
        var player2 = waiting_player;
        waiting_player = null;
        startGame(player1, player2);
    } else {
        waiting_player = player1;
    }
}

function startGame(p1, p2) {
    var session = new GameSession(p1, p2);
    p1.session = session;
    p2.session = session;

    p1.on('message', onMessage.bind(p1));
    p2.on('message', onMessage.bind(p2));

    updateStates(session);
}

function onMessage(e) {
    var session = this.session;
    session.makeMove(this, e.utf8Data);
    updateStates(session);
}

function updateStates(session) {
    var states = session.getState();
    session.p1.sendUTF(JSON.stringify(states[0]));
    session.p2.sendUTF(JSON.stringify(states[1]));
}

ws.on('request', function(req) {
    if (false) {
    } else if (req.resourceURL.pathname == '/player') {
        onPlayerJoin(req);
    } else {
        req.reject(404, 'Endpoint not found');
    }
});
