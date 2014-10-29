var JOINT_DIST = 100;

function Knots() {
    var ROPE_HEIGHT = 500,
        nodes = [];

    this._stage = new createjs.Stage('rope');
    this._rope = new createjs.Shape();
    this._stage.addChild(this._rope);

    for (var i = 0; i < 1 + ROPE_HEIGHT / JOINT_DIST; ++i) {
        // nodes.push([i*i, i * JOINT_DIST]);
        nodes.push([800/2 + i*JOINT_DIST, 20]);
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
        setStrokeStyle(1).beginStroke('black');

    this._simulate();

    this._rope.graphics.moveTo(this._nodes[0][0], this._nodes[0][1]);
    for (var i = 0; i < this._nodes.length; ++i) {
        this._rope.graphics.lineTo(this._nodes[i][0], this._nodes[i][1]);
        this._rope.graphics.drawCircle(this._nodes[i][0], this._nodes[i][1], 3);
    }

    this._stage.update();
    requestAnimationFrame(this._onFrame.bind(this));
};

Knots.prototype._simulate = function() {
    var prevN = this._prev_nodes;
    var n = cloneNodes(this._nodes);
    var newN;

    for (var i = 1; i < n.length; ++i) {
        n[i][0] += (n[i][0] - prevN[i][0]) * 1;
        n[i][1] += (n[i][1] - prevN[i][1]) * 1 + 1;
    }

    newN = cloneNodes(n);

    for (var i = 1; i < n.length; ++i) {
        var f;

        f = getSpringForce(n[i], n[i-1]);
        newN[i][0] += f[0];
        newN[i][1] += f[1];

        if (i < n.length - 1) {
            f = getSpringForce(n[i], n[i+1]);
            newN[i][0] += f[0];
            newN[i][1] += f[1];
        }
    }

    n = newN;
    newN = cloneNodes(n);

    for (var i = 1; i < n.length; ++i) {
        var f;

        f = getSpringForce(n[i], n[i-1]);
        newN[i][0] += f[0];
        newN[i][1] += f[1];

        if (i < n.length - 1) {
            f = getSpringForce(n[i], n[i+1]);
            newN[i][0] += f[0];
            newN[i][1] += f[1];
        }
    }

    this._prev_nodes = this._nodes;
    this._nodes = newN;
};

// Knots.prototype._simulate = function() {
//     var prevN = this._prev_nodes;
//     var n = this._nodes;
//     var newN = cloneNodes(n);
//
//     for(var i = 0; i < n.length; ++i){
//         newN[i][0] += (newN[i][0] - prevN[i][0]) * 0.92;
//         newN[i][1] += (newN[i][1] - prevN[i][1]) * 0.92;
//     }
//     
//     for(var i = 1; i < n.length; ++i){
//         
//         var c = newN[i];
//         var p = newN[i - 1];
//         var d, f, fx, fy, cnx, cny;
//         d = dist(c, p);
//         if(d > JOINT_DIST){
//             f = (d - JOINT_DIST) * 0.02;
//             cnx = (p[0] - c[0]) / d;
//             cny = (p[1] - c[1]) / d;
//             fx = cnx * f;
//             fy = cny * f;
//
//             newN[i][0] += fx;
//             newN[i][1] += fy;
//         }
//
//         newN[i][1] += 1;
//     }
//     
//     this._prev_nodes = n;
//     this._nodes = newN;
// };

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

function getSpringForce(from, to) {
    var d, f, cnx, cny, fx, fy;

    d = dist(from, to);
    JOINT_DIST = 0;
    if (d > JOINT_DIST) {
        f = (d - JOINT_DIST) * 0.05;
        cnx = (to[0] - from[0]) / d;
        cny = (to[1] - from[1]) / d;
        fx = cnx * f;
        fy = cny * f;

        return [fx, fy];
    }

    return [0, 0];
}

var knots = new Knots();
