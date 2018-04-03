import * as tf from "@tensorflow/tfjs"
// TODO(mysticatea): tf.models.modelFromJSON が何故か公開されていないため、無理矢理取得する。
//eslint-disable-next-line node/no-extraneous-import
import { modelFromJSON } from "@tensorflow/tfjs-layers/dist/models"

const RegularizerRate = 0.0001
const CnnFilters = 64
const CnnKernelSize = [4, 4]
const NumResidualLayers = 4

export class EvaluationModel {
    private dimension: EvaluationModel.Dimension
    private model: Promise<tf.Model>

    constructor(
        dimension: EvaluationModel.Dimension,
        serializedString?: string,
    ) {
        this.dimension = dimension
        this.model = serializedString
            ? modelFromJSON(JSON.parse(serializedString))
            : Promise.resolve(defineModel(dimension))
    }

    get inputSize(): number {
        const [a, b, c] = this.dimension.stateSize
        return a * b * c
    }

    async predict(
        state: Float32Array,
        batchSize: number,
    ): Promise<EvaluationModel.PredictResult[]> {
        const model = await this.model
        const [valueTensor, policyTensor] = tf.tidy(() => {
            const input = tf.tensor4d(
                state,
                [batchSize, ...this.dimension.stateSize] as any,
                "float32",
            )
            const output = model.predictOnBatch(input) as tf.Tensor[]
            return output
        })
        const valueArray = (await valueTensor.data()) as Float32Array
        const policyArray = (await policyTensor.data()) as Float32Array
        valueTensor.dispose()
        policyTensor.dispose()

        const result = new Array<EvaluationModel.PredictResult>(batchSize)
        const length = this.dimension.actionSize
        for (let i = 0; i < batchSize; ++i) {
            const value = valueArray[i]
            const policy = new Float32Array(
                policyArray.buffer,
                policyArray.byteOffset + 4 * i * length,
                length,
            )

            result[i] = { value, policy }
        }

        return result
    }

    async fit(trainingData: EvaluationModel.TrainingData[]): Promise<void> {
        const dim = this.dimension
        const model = await this.model
        let state: tf.Tensor | undefined
        let value: tf.Tensor | undefined
        let policy: tf.Tensor | undefined
        try {
            state = tf.tensor4d(
                concatFloat32Array(
                    trainingData,
                    "state",
                    dim.stateSize[0] * dim.stateSize[1] * dim.stateSize[2],
                ),
                [trainingData.length, ...dim.stateSize] as any,
                "float32",
            )
            value = tf.tensor1d(concatNumber(trainingData, "value"), "float32")
            policy = tf.tensor2d(
                concatFloat32Array(trainingData, "policy", dim.actionSize),
                [trainingData.length, dim.actionSize],
                "float32",
            )

            await model.fit(state, [value, policy])
        } finally {
            if (state) {
                state.dispose()
            }
            if (value) {
                value.dispose()
            }
            if (policy) {
                policy.dispose()
            }
        }
    }

    async serialize(): Promise<string> {
        const model = await this.model
        return model.toJSON()
    }

    async getWeights(): Promise<tf.Tensor[]> {
        const model = await this.model
        return model.getWeights()
    }

    async setWeights(weights: tf.Tensor[]): Promise<void> {
        const model = await this.model
        model.setWeights(weights)
    }
}

export namespace EvaluationModel {
    export interface Dimension {
        stateSize: [number, number, number]
        actionSize: number
    }

    export interface PredictResult {
        value: number
        policy: Float32Array
    }

    export interface TrainingData {
        state: Float32Array
        value: number
        policy: Float32Array
    }
}

//------------------------------------------------------------------------------

type IntermediateTensor =
    | tf.Tensor<tf.Rank>
    | tf.Tensor<tf.Rank>[]
    | tf.SymbolicTensor
    | tf.SymbolicTensor[]
type Layer = ReturnType<typeof tf.layers.conv2d>

function defineModel({
    stateSize,
    actionSize,
}: EvaluationModel.Dimension): tf.Model {
    const input = tf.input({
        name: "INPUT",
        shape: stateSize,
        dtype: "float32" as any, // TODO(mysticatea): https://github.com/tensorflow/tfjs/issues/120
    })
    const temp = defineHiddenLayers(input)
    const valueOutput = defineValueLayer(temp)
    const policyOutput = definePolicyLayer(temp, actionSize)
    const model = tf.model({
        inputs: [input],
        outputs: [valueOutput, policyOutput],
    })

    // TODO(mysticatea): https://github.com/tensorflow/tfjs/issues/98
    model.compile({
        optimizer: "sgd",
        loss: ["meanSquaredError", "meanSquaredError"],
    })
    model.lossFunctions[1] = softmaxCrossEntropy

    return model
}

function defineHiddenLayers(input: tf.SymbolicTensor): tf.Tensor {
    let output = sequence(
        input,
        conv2d(CnnFilters, CnnKernelSize),
        tf.layers.batchNormalization({ axis: 1 }),
        tf.layers.activation({ activation: "relu" }),
    ) as tf.Tensor

    for (let i = 0; i < NumResidualLayers; ++i) {
        output = defineResidualLayer(output)
    }

    return output
}

function defineResidualLayer(input: tf.Tensor): tf.Tensor {
    let output = sequence(
        input,
        conv2d(CnnFilters, CnnKernelSize),
        tf.layers.batchNormalization({ axis: 1 }),
        tf.layers.activation({ activation: "relu" }),
        conv2d(CnnFilters, CnnKernelSize),
        tf.layers.batchNormalization({ axis: 1 }),
    ) as tf.Tensor
    output = tf.layers.add().apply([input, output]) as tf.Tensor
    output = tf.layers
        .activation({ activation: "relu" })
        .apply(output) as tf.Tensor

    return output
}

function defineValueLayer(input: tf.Tensor): tf.SymbolicTensor {
    const lastLayer = tf.layers.dense({
        units: 1,
        useBias: false,
        activation: "tanh",
        kernelRegularizer: tf.regularizers.l2({ l2: RegularizerRate }),
    })
    sequence(
        input,
        conv2d(1, [1, 1]),
        tf.layers.batchNormalization({ axis: 1 }),
        tf.layers.activation({ activation: "relu" }),
        tf.layers.flatten(),
        tf.layers.dense({
            units: 20,
            useBias: false,
            activation: "linear",
            kernelRegularizer: tf.regularizers.l2({ l2: RegularizerRate }),
        }),
        tf.layers.activation({ activation: "relu" }),
        lastLayer,
    )
    return lastLayer.output as tf.SymbolicTensor
}

function definePolicyLayer(
    input: tf.Tensor,
    actionSize: number,
): tf.SymbolicTensor {
    const lastLayer = tf.layers.dense({
        units: actionSize,
        useBias: false,
        activation: "linear",
        kernelRegularizer: tf.regularizers.l2({ l2: RegularizerRate }),
    })
    sequence(
        input,
        conv2d(2, [1, 1]),
        tf.layers.batchNormalization({ axis: 1 }),
        tf.layers.activation({ activation: "relu" }),
        tf.layers.flatten(),
        lastLayer,
    )
    return lastLayer.output as tf.SymbolicTensor
}

function conv2d(filters: number, kernelSize: number[]): Layer {
    return tf.layers.conv2d({
        filters,
        kernelSize,
        dataFormat: "channelsFirst",
        padding: "same",
        useBias: false,
        activation: "linear",
        kernelRegularizer: tf.regularizers.l2({ l2: RegularizerRate }),
        dtype: "float32" as any,
    })
}

function sequence(
    input: IntermediateTensor,
    ...layers: Layer[]
): IntermediateTensor {
    return layers.reduce((x, layer) => layer.apply(x), input)
}

const softmaxCrossEntropy: tf.Model["lossFunctions"][0] = (yTrue, yPred) => {
    const p = tf.where(
        tf.equal(yTrue, tf.zeros(yTrue.shape)),
        tf.fill(yTrue.shape, -100),
        yPred,
    )

    return tf.losses.softmaxCrossEntropy(yTrue, p)
}

function concatFloat32Array(
    dataSource: EvaluationModel.TrainingData[],
    key: "state" | "policy",
    unitSize: number,
): Float32Array {
    const result = new Float32Array(dataSource.length * unitSize)

    for (let i = 0; i < dataSource.length; ++i) {
        const data = dataSource[i][key]
        const start = i * unitSize
        for (let j = 0; j < unitSize; ++j) {
            result[start + j] = data[j]
        }
    }

    return result
}

function concatNumber(
    dataSource: EvaluationModel.TrainingData[],
    key: "value",
): Float32Array {
    const result = new Float32Array(dataSource.length)

    for (let i = 0; i < dataSource.length; ++i) {
        result[i] = dataSource[i][key]
    }

    return result
}
