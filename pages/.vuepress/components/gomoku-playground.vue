<template>
    <div class="gomoku-playground-root">
        <!-- 九路盤 -->
        <svg class="gomoku-playground-board" viewBox="0 0 1000 1000" @mousemove="onMouseMove" @click.left="onClick">
            <path :d="gridPath" fill="none" stroke="#000" stroke-width="2" stroke-linecap="butt" />
            <template v-for="y in rows">
                <circle
                    v-for="x in cols"
                    :key="`R${y}C${x}`"
                    :class="stoneClass(x, y)"
                    :data-action="index(x, y)"
                    :cx="fx((x - 0.5) * 1000 / cols, x)"
                    :cy="fy((y - 0.5) * 1000 / rows, y)"
                    :r="360 / cols" />
            </template>
        </svg>
        <!-- ダイアログ -->
        <div v-if="mode === 'init'" class="gomoku-playground-dialog">
            <div v-if="message" class="gomoku-playground-dialog-message">{{ message }}</div>
            <div>
                <button @click="play">▶️ 開始</button>
                ( <label>読みの深さ <input v-model="depth" type="number" min="1" max="99" style="width: 3em; text-align: right;"></label> )
            </div>
        </div>
        <div v-if="mode === 'await'" class="gomoku-playground-dialog">
            <div class="gomoku-playground-dialog-message">{{ message }}</div>
        </div>
        <div v-if="mode === 'error'" class="gomoku-playground-dialog">
            <div class="gomoku-playground-dialog-message">エラーが発生しました。</div>
            <div>{{ message }}</div>
        </div>
    </div>
</template>

<script>
import * as d3 from "d3-path"
import { Agent, DelegatePlayer, Match } from "./lib/ai"
import { gomoku } from "./lib/gomoku"
import { waitForDraw } from "./lib/utils"

const gomokuMatch = new Match(gomoku)
const focusKey = Object.freeze(["focus-black", "focus-white"])

export default {
    data() {
        return {
            mode: "init",
            message: "",
            depth: 10,
            board: new Array(gomoku.rows * gomoku.cols).fill(-1),
            input: {
                resolve: null,
                player: -1,
                focus: -1,
                allowedActions: [],
            },
        }
    },

    computed: {
        cols() {
            return gomoku.cols
        },
        rows() {
            return gomoku.rows
        },

        dxs() {
            const length = this.rows * this.cols
            const d = 10
            return Array.from({ length }, () => (d * Math.random() - d / 2) | 0)
        },
        dys() {
            const length = this.rows * this.cols
            const d = 10
            return Array.from({ length }, () => (d * Math.random() - d / 2) | 0)
        },

        gridPath() {
            const edgeLength = 1000
            const rows = this.rows
            const cols = this.cols
            const stoneSize = (edgeLength / rows) | 0
            const padding = (stoneSize / 2) | 0
            const x0 = padding
            const y0 = padding
            const x1 = edgeLength - padding
            const y1 = edgeLength - padding
            const path = d3.path()

            for (let i = 0; i < cols; ++i) {
                const x = (x0 + i * stoneSize) | 0
                path.moveTo(x, y0)
                path.lineTo(x, y1)
            }
            for (let i = 0; i < rows; ++i) {
                const y = (y0 + i * stoneSize) | 0
                path.moveTo(x0, y)
                path.lineTo(x1, y)
            }

            return path.toString()
        },
    },

    methods: {
        async play() {
            try {
                const playerB = new DelegatePlayer(this.onPlayerActionStart)
                const playerW = new Agent({
                    rule: gomoku,
                    maxThinkingTime: {
                        type: "count",
                        value: Number(this.depth) || 10,
                    },
                })
                const result = await gomokuMatch.play({
                    players: [playerB, playerW],
                    onThinkStart: state => {
                        if (state.playerTurn === 0) {
                            this.mode = "play"
                        } else {
                            this.board = state.board.slice(0)
                            this.message = "AlphaZero 思考中..."
                            this.mode = "await"
                        }
                        return waitForDraw()
                    },
                })

                this.board = result.board.slice(0)
                this.message =
                    result.winner === 0
                        ? "あなたの勝ちです。"
                        : result.winner === 1
                            ? "AlphaZero の勝ちです。"
                            : "引き分けです。"
                this.mode = "init"
            } catch (err) {
                this.message = err.message
                this.mode = "error"
            }
        },

        onPlayerActionStart(state, resolve) {
            this.board = state.board.slice(0)
            this.input.player = state.playerTurn
            this.input.focus = -1
            this.input.allowedActions = state.actions.slice(0)
            this.input.resolve = action => {
                this.input.resolve = null
                this.input.player = -1
                this.input.focus = -1
                this.input.allowedActions = []
                resolve(gomoku.takeAction(state, action))
            }
        },

        onMouseMove(e) {
            const action = Number(e.target.dataset.action || "-1")
            const input = this.input
            if (
                input.resolve != null &&
                input.focus !== action &&
                input.allowedActions.includes(action)
            ) {
                input.focus = action
            }
        },

        onClick(e) {
            const action = Number(e.target.dataset.action || "-1")
            const input = this.input
            if (
                input.resolve != null &&
                input.allowedActions.includes(action)
            ) {
                input.resolve(action)
            }
        },

        index(x, y) {
            return this.cols * (y - 1) + (x - 1)
        },

        stoneClass(x, y) {
            const { board, input } = this
            const index = this.index(x, y)
            return {
                "gomoku-playground-stone": true,
                black: board[index] === 0,
                white: board[index] === 1,
                [focusKey[input.player]]: input.focus === index,
            }
        },

        fx(n, i) {
            return (n + this.dxs[i]) | 0
        },

        fy(n, i) {
            return (n + this.dys[i]) | 0
        },
    },
}
</script>

<style>
.gomoku-playground-root {
    position: relative;
}

.gomoku-playground-board {
    width: 100%;
    border-collapse: collapse;
    border: 1px outset gray;
    background: url(./wood.png) repeat;
}

.gomoku-playground-stone {
    fill: transparent;
    stroke: none;
}

.gomoku-playground-stone.black,
.gomoku-playground-stone.focus-black {
    fill: black;
    stroke: gray;
}

.gomoku-playground-stone.white,
.gomoku-playground-stone.focus-white {
    fill: white;
    stroke: gray;
}

.gomoku-playground-stone.focus-black,
.gomoku-playground-stone.focus-white {
    opacity: 0.5;
}

.gomoku-playground-dialog {
    position: absolute;
    left: 50%;
    top: 50%;
    width: fit-content;
    height: fit-content;
    min-width: 50%;
    padding: 32px;
    box-sizing: border-box;
    box-shadow: 4px 4px 16px rgba(0, 0, 0, 0.5);
    border: 1px solid gray;
    border-radius: 3px;
    background: rgba(255, 255, 255, 0.9);
    transform: translate(-50%, -50%);
    text-align: center;
}
.gomoku-playground-dialog-message {
    font-weight: bold;
    margin-bottom: 8px;
}
</style>
