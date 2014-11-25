/// <reference path="../defs/easeljs/easeljs.d.ts" />
/// <reference path="server_message.ts" />

class Point
{
    constructor(public x:number, public y:number) {}
}

function clone_nodes(nodes:Point[]):Point[]
{
    var result:Point[] = [];
    var len = nodes.length;
    for (var i = 0; i < len; ++i)
    {
        result.push(new Point(nodes[i].x, nodes[i].y));
    }
    return result;
}

class Rope extends createjs.Container
{
    private steps:number = 1;
    private step:number = 0;
    private current_state:Player_state_message = null;

    private static JOINT_DIST = 10;
    private static GRAVITY = 1;
    private nodes:Point[] = [];
    private prev_nodes:Point[];

    private rope:createjs.Shape;
    private player:createjs.Shape;
    private knots:createjs.Shape;

    constructor(private height:number)
    {
        super();

        this.rope = new createjs.Shape();
        this.create_rope_nodes(height);

        var g = this.rope.graphics;
        g.clear().setStrokeStyle(2).beginStroke("black");
        g.moveTo(0, 0).lineTo(0, this.height);

        this.player = new createjs.Shape();
        this.player.graphics.beginFill('red').drawRect(-10, -10, 20, 20);
        this.player.visible = false;

        this.knots = new createjs.Shape();

        this.addChild(this.rope);
        this.addChild(this.knots);
        this.addChild(this.player);
    }

    private create_rope_nodes(height:number):void
    {
        var node_count = Math.floor(height / Rope.JOINT_DIST) + 1;

        this.nodes.push(new Point(0, 0));
        for (var i = 1; i < node_count; ++i)
        {
            var n = new Point(Math.random() * Rope.JOINT_DIST * 3, 0);
            this.nodes.push(n);
        }

        this.prev_nodes = clone_nodes(this.nodes);
    }
    public set_steps(steps:number):void
    {
        this.steps = steps;
        this.step = this.height / steps;
    }

    public update_player(state:Player_state_message):void
    {
        if (!this.current_state)
        {
            this.do_first_player_update(state);
            return;
        }

        if (state.max_knots > this.current_state.max_knots)
        {
            this.draw_knot(state.max_knots);
        }
        this.player.y = this.y_for_index(state.height);
        // TODO do a failed climb animation
    }

    public on_frame():void
    {
        this.simulate();
        this.draw_rope();
    }

    private do_first_player_update(state:Player_state_message):void
    {
        this.player.visible = true;
        this.player.y = this.y_for_index(0);

        this.current_state = state;
    }

    private y_for_index(index:number):number
    {
        return (this.steps - index - 0.5) * this.step;
    }

    private draw_rope():void
    {
        var g = this.rope.graphics;

        g.clear().
            setStrokeStyle(2).beginStroke("black").
            moveTo(this.nodes[0].x, this.nodes[0].y);

        var len = this.nodes.length;
        for (var i = 1; i < len; ++i)
        {
            g.lineTo(this.nodes[i].x, this.nodes[i].y);
        }
    }

    private draw_knot(i:number):void
    {
        var y = this.y_for_index(i);

        this.knots.graphics.
            beginFill('black').drawCircle(0, y + 20, 8).
            endFill();
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
