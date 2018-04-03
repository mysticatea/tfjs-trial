import { GameState, GameRule, Player } from "../game"
import { EvaluationModel } from "./evaluation-model"
import { MonteCarloTree } from "./monte-carlo-tree"

const SimBatchSize = 8

export class Agent<TState extends GameState> implements Player<TState> {
    readonly model: EvaluationModel

    private mcts: MonteCarloTree<TState>
    private maxThinkingTime: Agent.Restriction
    private onAct: ((info: Agent.ActionInfo) => void) | undefined

    static new<TState extends GameState>({
        rule,
        serializedModel,
        maxThinkingTime = { type: "count", value: 16 },
        onAct,
    }: Agent.Config<TState>): Agent<TState> {
        return new Agent<TState>(
            rule,
            new EvaluationModel(rule, serializedModel),
            maxThinkingTime,
            onAct,
        )
    }

    static inherit<TState extends GameState>(
        originalAgent: Agent<TState>,
    ): Agent<TState> {
        return new Agent<TState>(
            originalAgent.mcts.rule,
            originalAgent.model,
            originalAgent.maxThinkingTime,
            originalAgent.onAct,
        )
    }

    constructor(
        rule: GameRule<TState>,
        model: EvaluationModel,
        maxThinkingTime: Agent.Restriction,
        onAct: ((info: Agent.ActionInfo) => void) | undefined,
    ) {
        this.model = model
        this.mcts = new MonteCarloTree(rule)
        this.maxThinkingTime = maxThinkingTime
        this.onAct = onAct
    }

    async act(state: TState): Promise<TState> {
        // Think
        this.mcts.changeRoot(state)
        if (this.maxThinkingTime.type === "count") {
            for (let i = this.maxThinkingTime.value; i > 0; --i) {
                await this.simulate()
            }
        } else {
            const until = Date.now() + this.maxThinkingTime.value
            do {
                await this.simulate()
            } while (Date.now() < until)
        }

        // Choose
        const {
            state: chosenState,
            action,
            value,
            policy,
        } = this.mcts.getBestAction()

        if (this.onAct) {
            const dataSize = this.model.inputSize
            const data = new Float32Array(dataSize)
            state.getStateData(data, 0)
            this.onAct({
                state: data,
                action,
                value,
                policy,
            })
        }

        return chosenState
    }

    private async simulate(): Promise<void> {
        const mcts = this.mcts!
        const queue = [] as MonteCarloTree.LeafInfo<TState>[]
        const ids = new Set<string>()
        let skipped = 0

        // Collect leaf nodes.
        while (queue.length < SimBatchSize && skipped < 4) {
            const info = mcts.getLeaf()
            const id = info.leaf.state.id

            if (ids.has(id)) {
                skipped += 1
                continue
            }
            ids.add(id)

            if (info.leaf.done) {
                backFill(info.leaf, info.route)
                continue
            }

            queue.push(info)
        }
        if (queue.length === 0) {
            return
        }

        // Read state
        const unitSize = this.model.inputSize
        const state = new Float32Array(queue.length * unitSize)
        for (let i = 0; i < queue.length; ++i) {
            queue[i].leaf.state.getStateData(state, i * unitSize)
        }

        // Predict on batch
        const result = await this.model.predict(state, queue.length)
        for (let i = 0; i < queue.length; ++i) {
            const { leaf, route } = queue[i]
            const { value, policy } = result[i]
            const actions = leaf.state.actions
            const probs = new Array(actions.length)

            let sum = 0
            for (let j = 0; j < probs.length; ++j) {
                sum += probs[j] = Math.exp(policy[actions[j]])
            }
            for (let j = 0; j < probs.length; ++j) {
                probs[j] /= sum
            }

            mcts.makeNextNodes(leaf, value, probs)
            backFill(leaf, route)
        }
    }
}

export { EvaluationModel }

export namespace Agent {
    export interface Config<TState extends GameState> {
        rule: GameRule<TState>
        serializedModel?: string
        maxThinkingTime?: Restriction
        onAct?: (info: ActionInfo) => void
    }

    export type Restriction =
        | { type: "count"; value: number }
        | { type: "tick"; value: number }

    export interface ActionInfo {
        state: Float32Array
        action: number
        value: number
        policy: Float32Array
    }
}

function backFill<TState extends GameState>(
    leaf: MonteCarloTree.Node<TState>,
    route: MonteCarloTree.Edge<TState>[],
): void {
    const leafPlayerTurn = leaf.state.playerTurn
    const value = leaf.value

    for (const edge of route) {
        const playerTurn = edge.inNode.state.playerTurn
        const direction = playerTurn === leafPlayerTurn ? 1 : -1

        edge.n = edge.n + 1
        edge.w = edge.w + value * direction
        edge.q = edge.w / edge.n
    }
}
