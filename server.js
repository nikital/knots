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

    p1.sendUTF('start');
    p2.sendUTF('start');
}

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
