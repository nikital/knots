interface Game_start_message
{
   rope_length:number;
}

interface Player_state_message
{
    height:number;
    max_knots:number;
    win:boolean;
}
interface Game_state_message
{
    self:Player_state_message;
    other:Player_state_message;
    your_turn:boolean;
}

interface Server_message
{
    // union:
    game_start:Game_start_message;
    state:Game_state_message;
    other_disconnected:boolean;
}
