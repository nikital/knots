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
    p1.sendUTF('start');
    p2.sendUTF('start');
}

ws.on('request', function(req) {
    if (false) {
    } else if (req.resourceURL.pathname == '/player') {
        onPlayerJoin(req);
    } else {
        req.reject(404, 'Endpoint not found');
    }
});
