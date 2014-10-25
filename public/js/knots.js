function Knots() {
    var ROPE_HEIGHT = 500;

    this._ws = new WebSocket('ws://' + window.location.host + '/player', 'knots');
    this._ws.onmessage = this._onMessage.bind(this);
    // TODO close and errors

    this._stage = new createjs.Stage('knots');

    this._rope_self = new Rope(ROPE_HEIGHT);
    this._rope_self.x = 800/3;

    this._rope_other = new Rope(ROPE_HEIGHT);
    this._rope_other.x = 800/3*2;

    this._steps = new Steps(ROPE_HEIGHT);
    this._stage.addChild(this._steps);

    this._stage.addChild(this._rope_self);
    this._stage.addChild(this._rope_other);

    this._steps.setSteps(5);

    this._climb_btn = document.getElementById('climb');
    this._tie_btn = document.getElementById('tie');
    this._climb_btn.onclick = this._onClimb.bind(this);
    this._tie_btn.onclick = this._onTie.bind(this);

    this._self_height = document.getElementById('self-height');
    this._self_knot = document.getElementById('self-knot');
    this._other_height = document.getElementById('other-height');
    this._other_knot = document.getElementById('other-knot');
    this._rope_height = document.getElementById('rope-height');

    requestAnimationFrame(this._stage.update.bind(this._stage));
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

function Rope(height) {
    this.DisplayObject_initialize();

    this._height = height;

    this._rope = new createjs.Shape();
    this._rope.graphics.
        beginFill("black").
        drawRect(-2, 0, 4, height);
    this.addChild(this._rope);

    this._player = new createjs.Shape();
    this._player.graphics.
        beginFill("red").
        drawRect(-5, -5, 10, 10);
    this._player.y = height - 20;
    this.addChild(this._player);
}

Rope.prototype = new createjs.Container();
Rope.prototype.constructor = Rope;

function Steps(height) {
    this.DisplayObject_initialize();
    this._height = height;
}

Steps.prototype = new createjs.Shape();
Steps.prototype.constructor = Steps;

Steps.prototype.setSteps = function (steps) {
    var i;

    this.graphics.
        clear().
        setStrokeStyle(1).beginStroke("#666");

    for (i = 1; i < steps; ++i) {
        var h = this._height / steps * i;
        this.graphics.
            moveTo(0, h).lineTo(800, h);
    }
};

var knots = new Knots();
