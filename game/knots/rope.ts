/// <reference path="../defs/easeljs/easeljs.d.ts" />
/// <reference path="server_message.ts" />

interface Point
{
    x:number;
    y:number;
}

interface PositionRotation
{
    position:Point;
    rotation:number;
}

function clone_nodes(nodes:Point[]):Point[]
{
    var result:Point[] = [];
    var len = nodes.length;
    for (var i = 0; i < len; ++i)
    {
        result.push({x: nodes[i].x, y: nodes[i].y});
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

    private player_y:number = 0;
    private knots_y:number[] = [];

    private rope:createjs.Shape;
    private player:createjs.Shape;

    constructor(private height:number)
    {
        super();

        this.rope = new createjs.Shape();
        this.create_rope_nodes(height);

        this.player = new createjs.Shape();
        this.player.graphics.beginFill('red').drawEllipse(-10, -20, 20, 30);
        this.player.visible = false;

        this.addChild(this.rope);
        this.addChild(this.player);
    }

    private create_rope_nodes(height:number):void
    {
        var node_count = Math.floor(height / Rope.JOINT_DIST) + 1;

        this.nodes.push({x: 0, y:0});
        for (var i = 1; i < node_count; ++i)
        {
            var n = {x: Math.random() * Rope.JOINT_DIST * 3, y: 0};
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
            this.knots_y.push(this.y_for_index(state.max_knots));
        }
        this.player_y = this.y_for_index(state.height);
        this.shock_rope(this.player_y);
        // TODO do a failed climb animation
    }

    public on_frame():void
    {
        this.simulate();
        this.draw_rope();
        this.attach_objects();
    }

    private do_first_player_update(state:Player_state_message):void
    {
        this.player.visible = true;
        this.player_y = this.y_for_index(0);
        this.knots_y.push(this.y_for_index(0));

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

        g.endStroke();
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

    private attach_objects():void
    {
        var p = this.position_rotation_on_rope_from_y(this.player_y);
        this.player.x = p.position.x;
        this.player.y = p.position.y;
        this.player.rotation = p.rotation / Math.PI * 180;

        var g = this.rope.graphics;
        g.beginFill('black');
        for (var i = 0; i < this.knots_y.length; ++i)
        {
            p = this.position_rotation_on_rope_from_y(this.knots_y[i] + 20);
            g.drawCircle(p.position.x, p.position.y, 7);
        }
        g.endFill();
    }

    private position_rotation_on_rope_from_y(y:number):PositionRotation
    {
        var i1 = Math.max(0, Math.floor(y / Rope.JOINT_DIST));
        var i2 = i1 + 1;
        if (i2 >= this.nodes.length)
        {
            i2 = this.nodes.length - 1;
            i1 = i2 - 1;
        }

        var p1 = this.nodes[i1];
        var p2 = this.nodes[i2];

        var t = y / Rope.JOINT_DIST - i1;

        var dx = p2.x - p1.x;
        var dy = p2.y - p1.y;
        var p = {
            x: p1.x + dx * t,
            y: p1.y + dy * t
        }

        return {position: p, rotation: Math.atan2(p2.y - p1.y, p2.x - p1.x) - Math.PI / 2};
    }

    private shock_rope(y:number):void
    {
        var i = Math.floor(y / Rope.JOINT_DIST);
        if (i <= 0 || i >= this.nodes.length)
        {
            return;
        }

        this.prev_nodes[i].x += 50;
        this.prev_nodes[i+1].x -= 50;
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
