/// <reference path="../defs/easeljs/easeljs.d.ts" />

class Grid extends createjs.Shape
{
    constructor(private rect:createjs.Rectangle)
    {
        super();
    }

    public set_steps(steps:number):void
    {
        this.graphics.clear().
            setStrokeStyle(1).beginStroke('#bbb');

        var step = this.rect.height / steps;;
        for (var i = 1; i < steps; ++i)
        {
            var y = this.rect.y + step * i;
            this.graphics.moveTo(this.rect.x, y);
            this.graphics.lineTo(this.rect.x + this.rect.width, y);
        }
    }
}
