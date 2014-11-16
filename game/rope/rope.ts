/// <reference path="../defs/easeljs/easeljs.d.ts" />

module rope
{
class Point
{
    constructor(public x:number, public y:number) {}
}

function clone_nodes(nodes:Point[]):Point[]
{
    var result:Point[] = [];
    nodes.forEach(n => { result.push(new Point(n.x, n.y)); });
    return result;
}

export class Rope
{
    private static ROPE_LENGTH = 400;
    private static JOINT_DIST = 10;
    private static GRAVITY = 1;

    private stage:createjs.Stage;
    private shape:createjs.Shape;

    private nodes:Point[] = [];
    private prev_nodes:Point[];

    constructor(canvas_name:string)
    {
        this.stage = new createjs.Stage(canvas_name);
        this.shape = new createjs.Shape();
        this.stage.addChild(this.shape);
        this.stage.addEventListener('stagemousemove', this.on_move.bind(this));

        this.create_rope_nodes();

        this.on_frame();
    }

    private create_rope_nodes():void
    {
        var node_count = Math.floor(Rope.ROPE_LENGTH / Rope.JOINT_DIST) + 1;
        for (var i = 0; i < node_count; ++i)
        {
            var n = new Point(200 + Math.random() * 10 + i * Rope.JOINT_DIST, 0);
            this.nodes.push(n);
        }

        this.prev_nodes = clone_nodes(this.nodes);
    }

    private on_move(e:createjs.MouseEvent):void
    {
        this.nodes[0].x = e.stageX;
        this.nodes[0].y = e.stageY;
    }

    private on_frame():void
    {
        this.simulate();
        this.draw();

        this.stage.update();
        requestAnimationFrame(this.on_frame.bind(this));
    }

    private draw():void
    {
        this.shape.graphics.clear().
            setStrokeStyle(2).beginStroke("black").
            moveTo(this.nodes[0].x, this.nodes[0].y);

        var len = this.nodes.length;
        for (var i = 1; i < len; ++i)
        {
            this.shape.graphics.lineTo(this.nodes[i].x, this.nodes[i].y);
        }
    }

    private simulate():void
    {
        var len = this.nodes.length;

        var n = clone_nodes(this.nodes);
        var p = this.prev_nodes;

        for (var i = 1; i < len; ++i)
        {
            n[i].x += n[i].x - p[i].x;
            n[i].y += n[i].y - p[i].y + Rope.GRAVITY;
        }

        for (var i = 0; i < len * 2; ++i)
        {
            Rope.relax_nodes(n);
        }

        this.prev_nodes = this.nodes;
        this.nodes = n;
    }

    private static relax_nodes(n:Point[]):void
    {
        var len = n.length - 1;
        for (var i = 0; i < len; ++i)
        {
            var p1 = n[i];
            var p2 = n[i+1];
            var dx = p2.x - p1.x;
            var dy = p2.y - p1.y;
            var dist = Math.sqrt(dx*dx + dy*dy);

            if (dist <= Rope.JOINT_DIST)
            {
                continue;
            }

            var move_by = (dist - Rope.JOINT_DIST) / dist;
            dx *= move_by;
            dy *= move_by;

            if (i == 0)
            {
                p2.x -= dx;
                p2.y -= dy;
            }
            else
            {
                p1.x += dx / 2;
                p1.y += dy / 2;
                p2.x -= dx / 2;
                p2.y -= dy / 2;
            }
    }
    }
}
}

var g = new rope.Rope("rope");
