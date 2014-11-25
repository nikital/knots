/// <reference path="../defs/easeljs/easeljs.d.ts" />
/// <reference path="rope.ts" />
/// <reference path="grid.ts" />
/// <reference path="control.ts" />
/// <reference path="server_message.ts" />

class Game extends createjs.Container
{
    private static SOCKET_ENDPOINT = 'ws://' + window.location.host + '/player';

    private control:Control;
    private grid:Grid;
    private self:Rope;
    private other:Rope;

    private socket:WebSocket;

    constructor(private width:number, private height:number)
    {
        super();

        this.init_ui();
        this.init_socket();

        this.control.on('control', this.on_control.bind(this));
    }

    private init_ui()
    {
        this.control = new Control();
        this.control.x = 100;
        this.control.y = this.height / 2;
        this.control.visible = false;

        // do rope layout
        var self_rope_x = this.width / 3;
        var rope_y = 50;
        var rope_height = this.height - 100;
        var other_rope_x = this.width / 3 * 2;
        var grid_expand_x = 50;

        this.self = new Rope(rope_height);
        this.self.x = self_rope_x
        this.self.y = rope_y;

        this.other = new Rope(rope_height);
        this.other.x = other_rope_x;
        this.other.y = rope_y;

        var rect = new createjs.Rectangle(
            self_rope_x - grid_expand_x, rope_y,
            other_rope_x - self_rope_x + grid_expand_x * 2, rope_height);
        this.grid = new Grid(rect);

        this.addChild(this.control);
        this.addChild(this.grid);
        this.addChild(this.self);
        this.addChild(this.other);
    }

    private init_socket()
    {
        this.socket = new WebSocket(Game.SOCKET_ENDPOINT, 'knots');
        this.socket.onmessage = this.on_message.bind(this);
        this.socket.onclose = this.on_socket_close.bind(this);
        this.socket.onerror = this.on_socket_error.bind(this);
    }

    public on_frame():void
    {
        this.self.on_frame();
        this.other.on_frame();
    }

    private on_message(e:MessageEvent):void
    {
        var msg = <Server_message>JSON.parse(e.data);
        if (msg.game_start !== undefined)
        {
            var game_start = msg.game_start;
            this.grid.set_steps(game_start.rope_length);
            this.self.set_steps(game_start.rope_length);
            this.other.set_steps(game_start.rope_length);
        }
        else if (msg.state !== undefined)
        {
            var state = msg.state;
            this.self.update_player(state.self);
            this.other.update_player(state.other);
            this.control.visible = state.your_turn;
            console.log(state);
        }
        else if (msg.other_disconnected !== undefined)
        {
            console.log('Other player disconnected');
        }
        else
        {
            console.warn('Unknown message');
        }
    }

    private on_control(command:createjs.Event):void
    {
        this.socket.send(command.target);
    }

    private on_socket_close(e:CloseEvent):void
    {
        console.warn(e);
        // TODO handle
    }

    private on_socket_error(e:Event):void
    {
        console.error(e);
        // TODO handle
    }
}
