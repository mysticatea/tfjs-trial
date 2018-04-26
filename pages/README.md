---
sidebarDepth: 3
---

# AlphaZero Clone

これは、ニューラルネットワークと [TensorFlow.js][tfjs] に関する理解を深めることを目的として作成した習作です。
[TensorFlow.js][tfjs] を利用して実装された AlphaZero クローンになります。

- [TensorFlow.js][tfjs] とは、Google 主導で開発されている機械学習フレームワークである [TensorFlow][tf] を JavaScript (TypeScript) で再実装した公式フレームワークです。[WebGL] を利用して GPU による計算を行えます。Web ブラウザ上で動作するため PC, スマホ, 携帯ゲーム機を含むさまざまな端末で動作し、端末上で深層学習を用いた評価・学習を実施できます。
- AlphaZero とは、Google 傘下の DeepMind から発表された論文 [Mastering Chess and Shogi by Self-Play with a General Reinforcement Learning Algorithm][1712.01815] で発表された汎用的な手順最適化アルゴリズムです。深層学習 (Value/Policy Networks) と[モンテカルロ木探索][mcts]をベースにしたものになっています。

## アルゴリズム解説

ゲームルールを次のように考えます。

$$
S_k=\begin{cases}
    S_0 & k=0 \\
    F(S_{k-1}, A_k) & k>0
\end{cases}
$$

> つまり、ゲームルールは「初期状態 $S_0$」と「前の状態 $S_{k-1}$ と行動 $A_k$ が与えられると次の状態 $S_k$ を返す関数 $F$」の2つから構成されます。

AlphaZero は、ある状態 $s$ にあるとき最適な行動 $a$ は何かを評価する汎用アルゴリズムです。手順最適化ソルバーとでも呼べば良さそうですね。予め $a$ や $a$ がどのような意味を持っているかを与える必要はありません。強化学習の中で、自分で見つけます。

> 例えば囲碁であれば、自分の石で囲めば得点になる等の情報は必要ありません。

AlphaZero は相互に影響し合う 2 種類の評価戦略を持っています。

<svg viewBox="0 0 800 280">
    <rect x="10" y="100" width="300" height="100" rx="8" ry="8" stroke="#f44336" fill="#ffebee" />
    <text x="28" y="150" font-size="24">新しい体験に基づく評価</text>
    <text x="28" y="174" font-size="20">(先読みによる最適手探索)</text>
    <rect x="490" y="100" width="300" height="100" rx="8" ry="8" stroke="#3f51b5" fill="#e8eaf6" />
    <text x="508" y="150" font-size="24">過去の体験に基づく評価</text>
    <text x="508" y="174" font-size="20">(value/policy netowrks)</text>
    <polygon points="0,10 100,10 100,0 140,20 100,40 100,30 0,30" stroke="#888" fill="#eee" transform="translate(330,160)" />
    <polygon points="0,10 100,10 100,0 140,20 100,40 100,30 0,30" stroke="#888" fill="#eee" transform="translate(470,100) scale(-1,1)" />
    <text x="240" y="60" font-size="20">どの手を優先して先読みするか? (policy network)</text>
    <text x="240" y="84" font-size="20">先読みした結果の価値は? (value network)</text>
    <text x="240" y="230" font-size="20">強化学習によるフィードバック</text>
</svg>

1. **新しい体験に基づく評価** ... 現在の状態 $S_m$ から手順の先読みを行い、先読みした状態 $S_f$ の評価を元に、$S_m$ での各行動 $A_n$ の価値を決定します。
2. **過去の体験に基づく評価** ... 過去の体験を元に、現在の状態 $S_m$ の価値と、$S_m$ における各行動 $A_n$ の価値を決定します。

すべての手順を先読みすることは現実的ではないため、過去の体験に基づいて先読みする手順の優先順位を決め、先読みした結果を評価します。
そして、先読みした結果の評価を元に現在の状態における各行動の価値を決定します。

最終的に勝敗がつくと、その勝敗と手順を元に過去の体験 (ニューラル ネットワーク) を更新します。

エレガントな構造ですね。

(書きかけです)

[tf]: https://www.tensorflow.org/
[tfjs]: https://js.tensorflow.org/
[1712.01815]: https://arxiv.org/abs/1712.01815
[WebGL]: https://www.khronos.org/webgl/
[mcts]: https://en.wikipedia.org/wiki/Monte_Carlo_tree_search
[DAG]: https://en.wikipedia.org/wiki/Directed_acyclic_graph
