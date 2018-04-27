import * as tf from "@tensorflow/tfjs";
export declare class EvaluationModel {
    private dimension;
    private model;
    constructor(dimension: EvaluationModel.Dimension, serializedString?: string);
    readonly inputSize: number;
    predict(state: Float32Array, batchSize: number): Promise<EvaluationModel.PredictResult[]>;
    fit(trainingData: EvaluationModel.TrainingData[]): ReturnType<tf.Model["fit"]>;
    serialize(): string;
}
export declare namespace EvaluationModel {
    interface Dimension {
        stateSize: [number, number, number];
        actionSize: number;
    }
    interface PredictResult {
        value: number;
        policy: Float32Array;
    }
    interface TrainingData {
        state: Float32Array;
        value: number;
        policy: Float32Array;
    }
}
