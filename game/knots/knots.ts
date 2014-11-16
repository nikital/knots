/// <reference path="../defs/easeljs/easeljs.d.ts" />
/// <reference path="game.ts" />

class Knots
{
    private stage:createjs.Stage;
    private game:Game;

    constructor(canvas:string)
    {
        this.stage = new createjs.Stage(canvas);

        this.create_game();

        this.on_frame();
    }

    private create_game():void
    {
        this.game = new Game();
        this.stage.addChild(this.game);
    }

    private on_frame():void
    {
        this.game.on_frame();
        this.stage.update();
        requestAnimationFrame(this.on_frame.bind(this));
    }
}

var knots = new Knots('knots');
