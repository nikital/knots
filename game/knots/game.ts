/// <reference path="../defs/easeljs/easeljs.d.ts" />
/// <reference path="rope.ts" />

class Game extends createjs.Container
{
    private self:Rope;

    constructor()
    {
        super();

        this.self = new Rope(300);
        this.self.x = 300;

        this.addChild(this.self);
    }

    public on_frame():void
    {
    }
}
