import { GameState, GameRule, Player } from "../game";
import { EvaluationModel } from "./evaluation-model";
export declare class Agent<TState extends GameState> implements Player<TState> {
    readonly model: EvaluationModel;
    private mcts;
    private maxThinkingTime;
    private onAct;
    constructor({rule, serializedModel, maxThinkingTime, onAct}: Agent.Config<TState>);
    reset(): void;
    act(state: TState): Promise<TState>;
    private simulate();
}
export { EvaluationModel };
export declare namespace Agent {
    interface Config<TState extends GameState> {
        rule: GameRule<TState>;
        serializedModel?: string;
        maxThinkingTime?: Restriction;
        onAct?: (info: ActionInfo) => void;
    }
    type Restriction = {
        type: "count";
        value: number;
    } | {
        type: "tick";
        value: number;
    };
    interface ActionInfo {
        state: Float32Array;
        action: number;
        value: number;
        policy: Float32Array;
    }
}
