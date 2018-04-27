import { GameState, GameRule, Player } from "./game";
export declare class Match<TState extends GameState> {
    private rule;
    constructor(rule: GameRule<TState>);
    play({players, signal, onThinkStart, onThinkEnd, onUpdate}: Match.Config<TState>): Promise<TState>;
}
export declare namespace Match {
    interface Config<TState extends GameState> {
        players: ReadonlyArray<Player<TState>>;
        signal?: AbortSignal;
        onThinkStart?: (state: TState, player: Player<TState>) => any;
        onThinkEnd?: (state: TState, player: Player<TState>) => any;
        onUpdate?: (state: TState) => any;
    }
}
