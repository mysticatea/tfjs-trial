export interface GameRule<TState extends GameState> {
    readonly stateSize: [number, number, number]
    readonly actionSize: number
    readonly initialState: TState

    takeAction(state: TState, action: number): TState
}

export interface GameState {
    readonly id: string
    readonly playerTurn: PlayerTurn
    readonly actions: ReadonlyArray<number>
    readonly winner?: PlayerTurn

    getStateData(outData: Float32Array): void
}

export interface Player<TState extends GameState> {
    act(state: TState): Promise<TState>
}

export enum PlayerTurn {
    Black = 1,
    White = 2,
}
