import { Agent, EvaluationModel } from "./agent"
import { GameState, GameRule } from "./game"
import { Match } from "./match"
import { sample } from "./util"

export class Training<TState extends GameState> {
    private rule: GameRule<TState>

    constructor(rule: GameRule<TState>) {
        this.rule = rule
    }

    //eslint-disable-next-line complexity
    async train({
        numPlayers = 2,
        playingLoops = 30,
        trainingLoops = 30,
        trainingSample = 256,
        scoreThreshold = 0.75,
        maxThinkingTime,
        initialSerializedModel,
        signal,
        onEpisodeBegin,
        onEpisodeEnd,
        onPlayBegin,
        onPlayEnd,
        onPlayStateChange,
        onTrainBegin,
        onTrainEnd,
    }: Training.Config<TState> = {}): Promise<Training.Result<TState>> {
        const rule = this.rule
        const match = new Match(rule)
        const trainingData = [] as EvaluationModel.TrainingData[]
        const bestPlayers = Array.from(
            { length: numPlayers - 1 },
            () =>
                new Agent({
                    rule,
                    serializedModel: initialSerializedModel,
                    maxThinkingTime,
                }),
        )
        const currentPlayer = new Agent({
            rule,
            serializedModel: initialSerializedModel,
            maxThinkingTime,
            onAct(info) {
                trainingData.push(info)
            },
        })

        for (let episode = 0; ; ++episode) {
            if (onEpisodeBegin) {
                await onEpisodeBegin(episode)
                checkAborted(signal)
            }

            // Play.
            let win = 0
            for (let i = 0; i < playingLoops; ++i) {
                if (onPlayBegin) {
                    await onPlayBegin(episode, i)
                    checkAborted(signal)
                }

                // Define players.
                const myTurn = i % numPlayers
                const players = bestPlayers.slice(0)
                players.splice(myTurn, 0, currentPlayer)

                // Play.
                const result = await match.play({
                    players,
                    signal,
                    onUpdate:
                        onPlayStateChange &&
                        (state => onPlayStateChange(episode, i, state)),
                })
                checkAborted(signal)

                // Make the result value.
                const [w, y, x] = this.rule.stateSize
                const resultStateData = new Float32Array(w * y * x)
                result.getStateData(resultStateData)
                trainingData.push({
                    state: resultStateData,
                    value: result.winner === myTurn ? 1 : -1,
                    policy: new Float32Array(this.rule.actionSize),
                })
                if (result.winner === myTurn) {
                    win += 1
                }
                if (onPlayEnd) {
                    await onPlayEnd(episode, i, win / (i + 1))
                    checkAborted(signal)
                }

                // Reset player's states.
                for (const p of bestPlayers) {
                    p.reset()
                }
                currentPlayer.reset()
            }

            // Finish if it wins enough.
            if (episode >= 1 && win / playingLoops >= scoreThreshold) {
                return {
                    finalSerializedModel: currentPlayer.model.serialize(),
                }
            }

            // Training
            const model = currentPlayer.model
            for (let i = 0; i < trainingLoops; ++i) {
                const actionSample = sample(trainingData, trainingSample)

                if (onTrainBegin) {
                    await onTrainBegin(episode, i)
                    checkAborted(signal)
                }

                const { epoch, history } = await model.fit(actionSample)
                checkAborted(signal)

                if (onTrainEnd) {
                    await onTrainEnd(episode, i, epoch, history)
                    checkAborted(signal)
                }
            }

            trainingData.length = 0
        }
    }
}

export namespace Training {
    export interface Config<TState extends GameState> {
        numPlayers?: number
        playingLoops?: number
        trainingLoops?: number
        trainingSample?: number
        scoreThreshold?: number
        maxThinkingTime?: Agent.Restriction
        initialSerializedModel?: string
        signal?: AbortSignal

        onEpisodeBegin?(episode: number): void | Promise<void>
        onEpisodeEnd?(episode: number): void | Promise<void>

        onPlayBegin?(episode: number, count: number): void | Promise<void>
        onPlayStateChange?(
            episode: number,
            count: number,
            state: TState,
        ): void | Promise<void>
        onPlayEnd?(
            episode: number,
            count: number,
            score: number,
        ): void | Promise<void>

        onTrainBegin?(episode: number, count: number): void | Promise<void>
        onTrainEnd?(
            episode: number,
            count: number,
            epoch: number[],
            history: any,
        ): void | Promise<void>
    }

    export interface Result<TState extends GameState> {
        finalSerializedModel: string
    }
}

function checkAborted(signal: AbortSignal | undefined): void {
    if (signal && signal.aborted) {
        throw new Error("aborted")
    }
}
