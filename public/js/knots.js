function Knots() {
    this._ws = new WebSocket('ws://' + window.location.host + '/player', 'knots');
    this._ws.onmessage = this._onMessage.bind(this);
    // TODO close and errors
}

Knots.prototype._onMessage = function(e) {
    console.log(e.data);
};

var knots = new Knots();
