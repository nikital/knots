function Knots() {
    this._ws = new WebSocket('ws://' + window.location.host + '/player', 'knots');
    this._ws.onmessage = this._onMessage.bind(this);
    // TODO close and errors

    this._climb_btn = document.getElementById('climb');
    this._tie_btn = document.getElementById('tie');
    this._climb_btn.onclick = this._onClimb.bind(this);
    this._tie_btn.onclick = this._onTie.bind(this);
}

Knots.prototype._onMessage = function(e) {
    console.log(e.data);
};

Knots.prototype._onClimb = function() {
    this._ws.send('climb');
};

Knots.prototype._onTie = function() {
    this._ws.send('tie');
};

var knots = new Knots();
