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

ws.on('request', function(req) {
    if (false) {
    } else if (req.resourceURL.pathname == '/player') {
        console.log('Player connected!');
    } else {
        req.reject(404, 'Endpoint not found');
    }
});
