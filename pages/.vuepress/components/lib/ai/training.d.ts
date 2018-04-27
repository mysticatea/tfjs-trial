import { Agent } from "./agent";
import { GameState, GameRule } from "./game";
export declare class Training<TState extends GameState> {
    private rule;
    constructor(rule: GameRule<TState>);
    train({numPlayers, playingLoops, trainingLoops, trainingSample, scoreThreshold, maxThinkingTime, initialSerializedModel, signal, onEpisodeBegin, onEpisodeEnd, onPlayBegin, onPlayEnd, onPlayStateChange, onTrainBegin, onTrainEnd}?: Training.Config<TState>): Promise<Training.Result<TState>>;
}
export declare namespace Training {
    interface Config<TState extends GameState> {
        numPlayers?: number;
        playingLoops?: number;
        trainingLoops?: number;
        trainingSample?: number;
        scoreThreshold?: number;
        maxThinkingTime?: Agent.Restriction;
        initialSerializedModel?: string;
        signal?: AbortSignal;
        onEpisodeBegin?(episode: number): void | Promise<void>;
        onEpisodeEnd?(episode: number): void | Promise<void>;
        onPlayBegin?(episode: number, count: number): void | Promise<void>;
        onPlayStateChange?(episode: number, count: number, state: TState): void | Promise<void>;
        onPlayEnd?(episode: number, count: number, score: number): void | Promise<void>;
        onTrainBegin?(episode: number, count: number): void | Promise<void>;
        onTrainEnd?(episode: number, count: number, epoch: number[], history: any): void | Promise<void>;
    }
    interface Result<TState extends GameState> {
        finalSerializedModel: string;
    }
}
