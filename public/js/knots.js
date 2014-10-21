function Knots() {
    this._ws = new WebSocket('ws://' + window.location.host + '/player', 'knots');
    this._ws.onmessage = this._onMessage.bind(this);
    // TODO close and errors

    this._climb_btn = document.getElementById('climb');
    this._tie_btn = document.getElementById('tie');
    this._climb_btn.onclick = this._onClimb.bind(this);
    this._tie_btn.onclick = this._onTie.bind(this);

    this._self_height = document.getElementById('self-height');
    this._self_knot = document.getElementById('self-knot');
    this._other_height = document.getElementById('other-height');
    this._other_knot = document.getElementById('other-knot');
    this._rope_height = document.getElementById('rope-height');
}

Knots.prototype._onMessage = function(e) {
    var data = JSON.parse(e.data),
        disabled = !data.your_turn || data.self.win || data.other.win;

    console.log(e.data);
    this._self_height.value = data.self.height;
    this._self_knot.value = data.self.max_knots;
    this._other_height.value = data.other.height;
    this._other_knot.value = data.other.max_knots;
    this._rope_height.value = data.rope_height

    this._climb_btn.disabled = disabled;
    this._tie_btn.disabled = disabled;

    if (data.self.win) {
        alert('You win!');
    } else if (data.other.win) {
        alert('Bend over ( ͡° ͜ʖ ͡°)');
    }
};

Knots.prototype._onClimb = function() {
    this._ws.send('climb');
};

Knots.prototype._onTie = function() {
    this._ws.send('tie');
};

var knots = new Knots();
