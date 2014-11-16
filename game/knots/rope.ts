/// <reference path="../defs/easeljs/easeljs.d.ts" />

class Rope extends createjs.Shape
{
    constructor(private height:number)
    {
        super();
        var g = this.graphics;
        g.clear().setStrokeStyle(2).beginStroke("black");
        g.moveTo(0, 0).lineTo(0, this.height);
    }
}
