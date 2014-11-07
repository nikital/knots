"use strict";

var JOINT_DIST = 10;

function Knots() {
    var ROPE_HEIGHT = 500,
        nodes = [];

    this._stage = new createjs.Stage('rope');
    this._rope = new createjs.Shape();
    this._stage.addChild(this._rope);

    for (var i = 0; i < 1 + ROPE_HEIGHT / JOINT_DIST; ++i) {
        nodes.push([800/2 + i * JOINT_DIST / 2, 0]);
    }
    this._nodes = nodes;
    this._prev_nodes = nodes;

    this._stage.addEventListener('stagemousemove', this._onMouseOver.bind(this));
    this._stage.enableMouseOver();

    this._onFrame();
}

Knots.prototype._onMouseOver = function(e) {
    this._nodes[0] = [e.stageX, e.stageY];
}

Knots.prototype._onFrame = function() {
    this._rope.graphics.clear().
        setStrokeStyle(2).beginStroke('black');

    this._simulate();

    this._rope.graphics.moveTo(this._nodes[0][0], this._nodes[0][1]);
    for (var i = 0; i < this._nodes.length; ++i) {
        this._rope.graphics.lineTo(this._nodes[i][0], this._nodes[i][1]);
    }

    this._stage.update();
    requestAnimationFrame(this._onFrame.bind(this));
};

Knots.prototype._simulate = function() {
    var prevN = this._prev_nodes,
        n = cloneNodes(this._nodes),
        i;

    for (i = 1; i < n.length; ++i) {
        n[i][0] += n[i][0] - prevN[i][0];
        n[i][1] += n[i][1] - prevN[i][1] + 1;
    }

    for (i = 0; i < n.length * 2; ++i) {
        constrainRope(n);
    }

    this._prev_nodes = this._nodes;
    this._nodes = n;
};

function constrainRope(n) {
    var i;

    for (i = 0; i < n.length - 1; ++i) {
        var n1 = n[i],
            n2 = n[i+1],
            d = dist(n1, n2);

        if (d > JOINT_DIST) {
            var toMove = (d - JOINT_DIST) / d,
                dx = (n2[0] - n1[0]) * toMove,
                dy = (n2[1] - n1[1]) * toMove;

            if (i != 0) {
                n1[0] += dx / 2;
                n2[0] -= dx / 2;
                n1[1] += dy / 2;
                n2[1] -= dy / 2;
            } else {
                n2[0] -= dx;
                n2[1] -= dy;
            }
        }
    }
}

function dist(p1, p2) {
    var dx = p1[0] - p2[0],
        dy = p1[1] - p2[1];

    return Math.sqrt(dx*dx + dy*dy);
}

function cloneNodes(n) {
    var newN = [];
    for (var i = 0; i < n.length; ++i) {
        newN.push([n[i][0], n[i][1]]);
    }
    return newN;
}

var knots = new Knots();
