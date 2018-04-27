export interface GameRule<TState extends GameState> {
    readonly stateSize: [number, number, number];
    readonly actionSize: number;
    readonly initialState: TState;
    takeAction(state: TState, action: number): TState;
}
export interface GameState {
    readonly id: string;
    readonly playerTurn: number;
    readonly actions: ReadonlyArray<number>;
    readonly winner?: number;
    getStateData(outData: Float32Array): void;
}
export interface Player<TState extends GameState> {
    act(state: TState): Promise<TState>;
}
