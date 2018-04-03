import { GameState, GameRule } from "../game"

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

    getLeaf(): MonteCarloTree.LeafInfo<TState> {
        let leaf = this.root
        const route = [] as MonteCarloTree.Edge<TState>[]

        while (leaf.edges.length !== 0) {
            const edge = chooseEdge(leaf, this.root)
            leaf = edge.outNode
            route.push(edge)
        }

        return { leaf, route }
    }

    makeNextNodes(
        node: MonteCarloTree.Node<TState>,
        value: number,
        probs: number[],
    ): void {
        if (node.done === true) {
            throw new Error("duplicate makeNextNodes() call.")
        }
        if (probs.length !== node.state.actions.length) {
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
    //eslint-disable-next-line no-shadow
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
        readonly p: number
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
            this.p = prior
        }
    }

    export interface LeafInfo<TState extends GameState> {
        leaf: MonteCarloTree.Node<TState>
        route: MonteCarloTree.Edge<TState>[]
    }
}

function chooseEdge<TState extends GameState>(
    node: MonteCarloTree.Node<TState>,
    rootNode: MonteCarloTree.Node<TState>,
): MonteCarloTree.Edge<TState> {
    switch (node.edges.length) {
        case 0:
            throw new Error("chooseEdge on a leaf.")
        case 1:
            return node.edges[0]
        default:
            return node === rootNode
                ? chooseRootEdge(node)
                : chooseRestEdge(node)
    }
}

function chooseRootEdge<TState extends GameState>(
    node: MonteCarloTree.Node<TState>,
): MonteCarloTree.Edge<TState> {
    return node.edges[(Math.random() * node.edges.length) | 0]
}

function chooseRestEdge<TState extends GameState>(
    node: MonteCarloTree.Node<TState>,
): MonteCarloTree.Edge<TState> {
    const nb = Math.sqrt(node.edges.reduce(sumN, 0))
    let maxQU = Number.NEGATIVE_INFINITY
    let maxEdge: MonteCarloTree.Edge<TState>

    for (const edge of node.edges) {
        const { n, q, p } = edge
        const u = Cpuct * p * nb / (1 + n)

        if (q + u > maxQU) {
            maxQU = q + u
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
