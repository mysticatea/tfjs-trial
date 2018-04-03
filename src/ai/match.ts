import { GameState, GameRule, Player } from "./game"

export class Match<TState extends GameState> {
    private rule: GameRule<TState>

    constructor(rule: GameRule<TState>) {
        this.rule = rule
    }

    async play(
        black: Player<TState>,
        white: Player<TState>,
        observer?: Match.Observer<TState>,
    ): Promise<TState> {
        let currentState = this.rule.initialState
        let currentPlayer = black

        if (observer && observer.onUpdate) {
            await observer.onUpdate(currentState)
        }

        do {
            if (observer && observer.onThinkStart) {
                await observer.onThinkStart(currentState, currentPlayer)
            }

            currentState = await currentPlayer.act(currentState)

            if (observer && observer.onThinkEnd) {
                await observer.onThinkEnd(currentState, currentPlayer)
            }
            if (observer && observer.onUpdate) {
                await observer.onUpdate(currentState)
            }

            currentPlayer = currentPlayer === black ? white : black
        } while (currentState.actions.length > 0)

        return currentState
    }
}

export namespace Match {
    export interface Observer<TState extends GameState> {
        onThinkStart?: (state: TState, player: Player<TState>) => any
        onThinkEnd?: (state: TState, player: Player<TState>) => any
        onUpdate?: (state: TState) => any
    }
}
