import { GameState, Player } from "./game";
export declare type Delegate<TState extends GameState> = (state: TState, resolve: (state: TState) => void, reject: (error: Error) => void) => void;
export declare class DelegatePlayer<TState extends GameState> implements Player<TState> {
    private onAct;
    constructor(onAct: Delegate<TState>);
    act(state: TState): Promise<TState>;
}
