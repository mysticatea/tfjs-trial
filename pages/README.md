# AlphaZero Clone

これは、ニューラルネットワークと [TensorFlow.js][tfjs] に関する理解を深めることを目的として作成した習作です。
[TensorFlow.js][tfjs] を利用して実装された AlphaZero クローンになります。

> ※ まだちゃんと動きません。

- [TensorFlow.js][tfjs] とは、Google 主導で開発されている機械学習フレームワークである [TensorFlow][tf] を JavaScript (TypeScript) で再実装した公式フレームワークです。[WebGL] を利用して GPU による計算を行えます。Web ブラウザ上で動作するため PC, スマホ, 携帯ゲーム機を含むさまざまな端末で動作し、端末上で深層学習を用いた評価・学習を実施できます。
- AlphaZero とは、Google 傘下の DeepMind から発表された論文 [Mastering Chess and Shogi by Self-Play with a General Reinforcement Learning Algorithm][1712.01815] で発表された汎用的な手順最適化アルゴリズムです。深層学習 (Value/Policy Networks) と[モンテカルロ木探索][mcts]をベースにしたものになっています。

[tf]: https://www.tensorflow.org/
[tfjs]: https://js.tensorflow.org/
[1712.01815]: https://arxiv.org/abs/1712.01815
[WebGL]: https://www.khronos.org/webgl/
[mcts]: https://en.wikipedia.org/wiki/Monte_Carlo_tree_search
