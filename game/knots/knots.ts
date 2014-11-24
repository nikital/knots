/// <reference path="../defs/easeljs/easeljs.d.ts" />
/// <reference path="game.ts" />

class Knots
{
    private stage:createjs.Stage;
    private width:number;
    private height:number;

    private game:Game;

    constructor(canvas:HTMLCanvasElement)
    {
        createjs.Ticker.setFPS(60);

        this.stage = new createjs.Stage(canvas);
        this.stage.enableMouseOver();

        this.width = canvas.width;
        this.height = canvas.height;

        this.create_game();

        this.on_frame();
    }

    private create_game():void
    {
        this.game = new Game(this.width, this.height);
        this.stage.addChild(this.game);
    }

    private on_frame():void
    {
        this.game.on_frame();

        this.stage.update();
        requestAnimationFrame(this.on_frame.bind(this));
    }
}

var knots = new Knots(<HTMLCanvasElement>document.getElementById('knots'));
