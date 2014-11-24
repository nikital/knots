/// <reference path="../defs/easeljs/easeljs.d.ts" />
/// <reference path="server_message.ts" />

class Rope extends createjs.Container
{
    private steps:number = 1;
    private step:number = 0;
    private current_state:Player_state_message = null;

    private rope:createjs.Shape;
    private player:createjs.Shape;
    private knots:createjs.Shape;

    constructor(private height:number)
    {
        super();

        this.rope = new createjs.Shape();

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

    private draw_knot(i:number):void
    {
        var y = this.y_for_index(i);

        this.knots.graphics.
            beginFill('black').drawCircle(0, y + 20, 8).
            endFill();
    }
}
