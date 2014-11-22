/// <reference path="../defs/easeljs/easeljs.d.ts" />

class Text_button extends createjs.Container
{
    constructor(text:string)
    {
        super();

        var shape = new createjs.Shape();
        shape.graphics.beginFill('#AAA').drawCircle(0, 0, 40);

        var textfield = new createjs.Text(text, '24px arial');
        textfield.x = -textfield.getMeasuredWidth() / 2;
        textfield.y = -textfield.getMeasuredHeight() / 2;

        this.addChild(shape);
        this.addChild(textfield);

        this.cursor = 'pointer';
    }
}

class Control extends createjs.Container
{
    private climb:Text_button;
    private tie:Text_button;

    constructor()
    {
        super();

        this.climb = new Text_button('Up');
        this.climb.y = -60;

        this.tie = new Text_button('Tie');
        this.tie.y = 60;

        this.addChild(this.climb);
        this.addChild(this.tie);

        this.climb.on('click', () => { this.dispatchEvent('control', 'climb'); });
        this.tie.on('click', () => { this.dispatchEvent('control', 'tie'); });
    }
}
