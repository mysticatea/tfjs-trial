import { GameState, GameRule } from "../game"
import { sample } from "../util"

const Cpuct = 5

export class MonteCarloTree<TState extends GameState> {
    readonly rule: GameRule<TState>

    private root: MonteCarloTree.Node<TState>
    private nodes = new Map<string, MonteCarloTree.Node<TState>>()

    constructor(rule: GameRule<TState>) {
        this.rule = rule
        this.root = new MonteCarloTree.Node(rule.initialState)
        this.nodes.set(this.root.state.id, this.root)
    }

    changeRoot(state: TState): MonteCarloTree.Node<TState> {
        const node = this.nodes.get(state.id)
        if (node) {
            // TODO(mysticatea): Remove nodes it never uses in the future.
            this.root = node
        } else {
            this.root = new MonteCarloTree.Node(state)
            this.nodes.set(state.id, this.root)
        }

        return this.root
    }

    getBestAction(): {
        state: TState
        action: number
        value: number
        policy: Float32Array
    } {
        const policy = new Float32Array(this.rule.actionSize)
        const edges = this.root.edges
        let policySum = 0
        let maxPolicy = Number.MIN_SAFE_INTEGER
        const maxPolicyEdges = [] as MonteCarloTree.Edge<TState>[]

        for (const edge of edges) {
            policy[edge.action] = edge.n
            policySum += edge.n

            if (edge.n > maxPolicy) {
                maxPolicy = edge.n
                maxPolicyEdges.length = 0
            }
            if (edge.n === maxPolicy) {
                maxPolicyEdges.push(edge)
            }
        }
        for (let i = 0; i < policy.length; ++i) {
            policy[i] /= policySum
        }

        const size = maxPolicyEdges.length
        const chosenEdge =
            size === 1
                ? maxPolicyEdges[0]
                : maxPolicyEdges[(Math.random() * size) | 0]

        return {
            state: chosenEdge.outNode.state,
            action: chosenEdge.action,
            value: chosenEdge.q,
            policy,
        }
    }

    getLeaves(count: number = 1): MonteCarloTree.LeafInfo<TState>[] {
        if (this.root.edges.length === 0) {
            return [{ leaf: this.root, route: [] }]
        }
        return sample(this.root.edges, count)
            .map(getLeaf)
            .filter(uniqueLeaf, new Set<string>())
    }

    makeNextNodes(
        node: MonteCarloTree.Node<TState>,
        value: number,
        probs: number[],
    ): void {
        if (node.done === true) {
            debugger
            throw new Error("duplicate makeNextNodes() call.")
        }
        if (probs.length !== node.state.actions.length) {
            debugger
            throw new Error("probs.length must be same as actions.length")
        }

        node.value = value
        node.done = true

        const state = node.state
        for (let i = 0, end = probs.length; i < end; ++i) {
            const action = state.actions[i]
            const prior = probs[i]
            const newState = this.rule.takeAction(state, action)

            let outNode = this.nodes.get(newState.id)
            if (!outNode) {
                outNode = new MonteCarloTree.Node(newState)
                this.nodes.set(newState.id, outNode)
            }

            node.edges.push(
                new MonteCarloTree.Edge(node, outNode, action, prior),
            )
        }
    }
}

export namespace MonteCarloTree {
    export class Node<TState extends GameState> {
        readonly state: TState
        readonly edges: Edge<TState>[] = []
        value: number = 0
        done: boolean = false

        constructor(state: TState) {
            this.state = state
        }
    }

    export class Edge<TState extends GameState> {
        readonly inNode: Node<TState>
        readonly outNode: Node<TState>
        readonly action: number
        readonly prior: number
        n: number = 0
        w: number = 0
        q: number = 0

        constructor(
            inNode: Node<TState>,
            outNode: Node<TState>,
            action: number,
            prior: number,
        ) {
            this.inNode = inNode
            this.outNode = outNode
            this.action = action
            this.prior = prior
        }
    }

    export interface LeafInfo<TState extends GameState> {
        leaf: MonteCarloTree.Node<TState>
        route: MonteCarloTree.Edge<TState>[]
    }
}

function getLeaf<TState extends GameState>(
    firstEdge: MonteCarloTree.Edge<TState>,
): MonteCarloTree.LeafInfo<TState> {
    let leaf = firstEdge.outNode
    const route = [firstEdge]

    while (leaf.edges.length !== 0) {
        const edge = chooseEdge(leaf)
        leaf = edge.outNode
        route.push(edge)
    }

    return { leaf, route }
}

function uniqueLeaf<TState extends GameState>(
    this: Set<string>,
    { leaf }: MonteCarloTree.LeafInfo<TState>,
): boolean {
    const id = leaf.state.id
    if (this.has(id)) {
        return false
    }
    this.add(id)
    return true
}

function chooseEdge<TState extends GameState>(
    node: MonteCarloTree.Node<TState>,
): MonteCarloTree.Edge<TState> {
    const nb = Math.sqrt(node.edges.reduce(sumN, 0))
    let maxQU = Number.NEGATIVE_INFINITY
    let maxEdge: MonteCarloTree.Edge<TState>

    for (const edge of node.edges) {
        const { n, q, prior } = edge
        const u = Cpuct * prior * nb / (1 + n)
        const qu = q + u

        if (qu > maxQU) {
            maxQU = qu
            maxEdge = edge
        }
    }

    return maxEdge!
}

function sumN<TState extends GameState>(
    n: number,
    edge: MonteCarloTree.Edge<TState>,
): number {
    return n + edge.n
}
