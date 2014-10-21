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
    this._p1 = p1;
    this._p2 = p2;

    this._p1_state = {height: 0, max_knots: 0};
    this._p2_state = {height: 0, max_knots: 0};
    this._active_player = p1;
}

GameSession.prototype.getState = function() {
    var p1_state = {
        self: this._p1_state,
        other: this._p2_state,
        your_turn: this._active_player == this._p1
    };
    var p2_state = {
        self: this._p2_state,
        other: this._p1_state,
        your_turn: this._active_player == this._p2
    };

    return [p1_state, p2_state];
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

    var states = session.getState();
    p1.sendUTF(JSON.stringify(states[0]));
    p2.sendUTF(JSON.stringify(states[1]));
}

function onMessage(e) {
    var session = this.session;
    if (session._p1 === this) {
        console.log('msg from p1');
    } else if (session._p2 === this) {
        console.log('msg from p2');
    } else {
        console.log('wtf');
    }

    console.log(e.utf8Data);
}

ws.on('request', function(req) {
    if (false) {
    } else if (req.resourceURL.pathname == '/player') {
        onPlayerJoin(req);
    } else {
        req.reject(404, 'Endpoint not found');
    }
});
