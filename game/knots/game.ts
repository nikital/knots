/// <reference path="../defs/easeljs/easeljs.d.ts" />
/// <reference path="rope.ts" />
/// <reference path="server_message.ts" />

class Game extends createjs.Container
{
    private static SOCKET_ENDPOINT = 'ws://' + window.location.host + '/player';

    private self:Rope;
    private other:Rope;

    private socket:WebSocket;

    constructor(private width:number, private height:number)
    {
        super();

        this.init_ui();
        this.init_socket();
    }

    private init_ui()
    {
        this.self = new Rope(this.height - 100);
        this.self.x = this.width / 3;
        this.self.y = 50;

        this.other = new Rope(this.height - 100);
        this.other.x = this.width / 3 * 2;
        this.other.y = 50;

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
    }

    private on_message(e:MessageEvent):void
    {
        var msg = <Server_message>JSON.parse(e.data);
        if (msg.game_start !== undefined)
        {
            var game_start = msg.game_start;
            console.log('Game started with rope: ' + game_start.rope_length);
        }
        else if (msg.state !== undefined)
        {
            var state = msg.state;
            console.log('Current state', state);
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
