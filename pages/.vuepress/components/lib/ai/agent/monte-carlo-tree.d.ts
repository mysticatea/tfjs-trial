import { GameState, GameRule } from "../game";
export declare class MonteCarloTree<TState extends GameState> {
    readonly rule: GameRule<TState>;
    private root;
    private nodes;
    constructor(rule: GameRule<TState>);
    changeRoot(state: TState): MonteCarloTree.Node<TState>;
    getBestAction(): {
        state: TState;
        action: number;
        value: number;
        policy: Float32Array;
    };
    getLeaves(count?: number): MonteCarloTree.LeafInfo<TState>[];
    makeNextNodes(node: MonteCarloTree.Node<TState>, value: number, probs: number[]): void;
}
export declare namespace MonteCarloTree {
    class Node<TState extends GameState> {
        readonly state: TState;
        readonly edges: Edge<TState>[];
        value: number;
        done: boolean;
        constructor(state: TState);
    }
    class Edge<TState extends GameState> {
        readonly inNode: Node<TState>;
        readonly outNode: Node<TState>;
        readonly action: number;
        readonly prior: number;
        n: number;
        w: number;
        q: number;
        constructor(inNode: Node<TState>, outNode: Node<TState>, action: number, prior: number);
    }
    interface LeafInfo<TState extends GameState> {
        leaf: MonteCarloTree.Node<TState>;
        route: MonteCarloTree.Edge<TState>[];
    }
}
