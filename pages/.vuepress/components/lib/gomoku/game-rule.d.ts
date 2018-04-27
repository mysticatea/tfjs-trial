import { GameRule } from "../ai";
import { GomokuState } from "./game-state";
export declare class GomokuRule implements GameRule<GomokuState> {
    stateSize: [number, number, number];
    actionSize: number;
    initialState: GomokuState;
    rows: number;
    cols: number;
    takeAction(state: GomokuState, action: number): GomokuState;
}
