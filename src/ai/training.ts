import { Agent } from "./agent"
import { GameState, GameRule, PlayerTurn } from "./game"
import { Match } from "./match"

export class Training<TState extends GameState> {
    private rule: GameRule<TState>
    private episodes: number
    private trainingLoops: number
    private trainingSample: number
    private scoreThreshold: number
    private maxThinkingTime: Agent.Restriction | undefined

    constructor({
        rule,
        episodes = 30,
        trainingLoops = 20,
        trainingSample = 256,
        scoreThreshold = 0.9,
        maxThinkingTime,
    }: Training.Config<TState>) {
        this.rule = rule
        this.episodes = episodes
        this.trainingLoops = trainingLoops
        this.trainingSample = trainingSample
        this.scoreThreshold = scoreThreshold
        this.maxThinkingTime = maxThinkingTime
    }

    async train(
        initialSerializedModel?: string,
    ): Promise<Training.Result<TState>> {
        const match = new Match(this.rule)
        const history = [] as Agent.ActionInfo[]
        let bestPlayer = Agent.new({
            rule: this.rule,
            serializedModel: initialSerializedModel,
            maxThinkingTime: this.maxThinkingTime,
        })
        let currentPlayer = Agent.new({
            rule: this.rule,
            serializedModel: initialSerializedModel,
            maxThinkingTime: this.maxThinkingTime,
            onAct(info) {
                history.push(info)
            },
        })

        for (;;) {
            // Play.
            console.group("Training.")
            let win = 0
            for (let i = 0; i < this.episodes; ++i) {
                console.log("Play %d.", i)
                const odd = Boolean(i & 0x01)
                const result = await match.play(
                    odd ? bestPlayer : currentPlayer,
                    odd ? currentPlayer : bestPlayer,
                )
                const myTurn = odd ? PlayerTurn.White : PlayerTurn.Black

                if (result.winner === myTurn) {
                    win += 1
                }

                bestPlayer = Agent.inherit(bestPlayer)
                currentPlayer = Agent.inherit(currentPlayer)
            }
            console.log("Score %d%%", (100 * win / this.episodes) | 0)
            if (win / this.episodes >= this.scoreThreshold) {
                console.log("Finish!")
                console.groupEnd()
                return {
                    finalSerializedModel: await currentPlayer.model.serialize(),
                }
            }

            // Training
            const model = currentPlayer.model
            for (let i = 0; i < this.trainingLoops; ++i) {
                console.log("Train %d.", i)
                const actionSample = sample(history, this.trainingSample)
                await model.fit(actionSample)
            }

            history.length = 0
            console.groupEnd()
        }
    }
}

export namespace Training {
    export interface Config<TState extends GameState> {
        rule: GameRule<TState>
        episodes?: number
        trainingLoops?: number
        trainingSample?: number
        scoreThreshold?: number
        maxThinkingTime?: Agent.Restriction
    }

    export interface Result<TState extends GameState> {
        finalSerializedModel: string
    }
}

function sample<T>(array: T[], count: number): T[] {
    const result = array.slice(0)

    for (let i = result.length - 1; i > 0; --i) {
        const j = (Math.random() * (i + 1)) | 0
        const temp = result[i]
        result[i] = result[j]
        result[j] = temp
    }

    return result.slice(0, count)
}
