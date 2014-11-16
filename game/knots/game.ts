/// <reference path="../defs/easeljs/easeljs.d.ts" />
/// <reference path="rope.ts" />

class Game extends createjs.Container
{
    private self:Rope;
    private other:Rope;

    constructor(private width:number, private height:number)
    {
        super();

        this.self = new Rope(height - 100);
        this.self.x = this.width / 3;
        this.self.y = 50;

        this.other = new Rope(height - 100);
        this.other.x = this.width / 3 * 2;
        this.other.y = 50;

        this.addChild(this.self);
        this.addChild(this.other);
    }

    public on_frame():void
    {
    }
}
