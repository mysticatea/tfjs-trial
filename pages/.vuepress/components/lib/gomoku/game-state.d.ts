import { GameState } from "../ai";
export declare class GomokuState implements GameState {
    readonly id: string;
    readonly playerTurn: number;
    readonly winner: number;
    readonly board: ReadonlyArray<number>;
    readonly actions: ReadonlyArray<number>;
    constructor(id: string, playerTurn: number, winner: number, board: ReadonlyArray<number>, actions: ReadonlyArray<number>);
    getStateData(outData: Float32Array): void;
}
