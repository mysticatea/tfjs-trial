import { GameState, GameRule, Player } from "./game"

export class Match<TState extends GameState> {
    private rule: GameRule<TState>

    constructor(rule: GameRule<TState>) {
        this.rule = rule
    }

    async play({
        players,
        signal,
        onThinkStart,
        onThinkEnd,
        onUpdate,
    }: Match.Config<TState>): Promise<TState> {
        let currentState = this.rule.initialState
        let currentPlayer = players[currentState.playerTurn]

        if (onUpdate) {
            await onUpdate(currentState)
            checkAborted(signal)
        }

        do {
            if (onThinkStart) {
                await onThinkStart(currentState, currentPlayer)
                checkAborted(signal)
            }

            currentState = await currentPlayer.act(currentState)
            checkAborted(signal)

            if (onThinkEnd) {
                await onThinkEnd(currentState, currentPlayer)
                checkAborted(signal)
            }
            if (onUpdate) {
                await onUpdate(currentState)
                checkAborted(signal)
            }

            currentPlayer = players[currentState.playerTurn]
        } while (currentState.actions.length > 0)

        return currentState
    }
}

export namespace Match {
    export interface Config<TState extends GameState> {
        players: ReadonlyArray<Player<TState>>
        signal?: AbortSignal
        onThinkStart?: (state: TState, player: Player<TState>) => any
        onThinkEnd?: (state: TState, player: Player<TState>) => any
        onUpdate?: (state: TState) => any
    }
}

function checkAborted(signal: AbortSignal | undefined): void {
    if (signal && signal.aborted) {
        throw new Error("aborted")
    }
}
