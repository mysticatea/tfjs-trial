import { GameState, Player } from "./game"

export type Delegate<TState extends GameState> = (
    state: TState,
    resolve: (state: TState) => void,
    reject: (error: Error) => void,
) => void

export class DelegatePlayer<TState extends GameState>
    implements Player<TState> {
    private onAct: Delegate<TState>

    constructor(onAct: Delegate<TState>) {
        this.onAct = onAct
    }

    act(state: TState): Promise<TState> {
        return new Promise<TState>((resolve, reject) => {
            this.onAct(state, resolve, reject)
        })
    }
}
