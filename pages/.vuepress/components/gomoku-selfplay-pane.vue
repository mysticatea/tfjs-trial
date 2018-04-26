<template>
    <div class="gomoku-selfplay-pane-root">
        <!-- メニュー -->
        <div class="gomoku-selfplay-pane-settings">
            <div>
                黒:
                <label>読みの深さ <input v-model="black.depth" :disabled="isPlaying" type="number" min="1" max="99"></label>
            </div>
            <div>
                白:
                <label>読みの深さ <input v-model="white.depth" :disabled="isPlaying" type="number" min="1" max="99"></label>
            </div>
            <div>
                <button v-if="!isPlaying" @click="play">▶️ 開始する</button>
                <button v-else @click="abort">❌ 中止する</button>
                {{ message }}
            </div>
        </div>
        <div class="gomoku-selfplay-pane-container">
            <go-board :board="board" :rows="rows" :cols="cols" />
        </div>
    </div>
</template>

<script>
import { AbortController } from "abort-controller"
import { Agent, Match } from "./lib/ai"
import { gomoku } from "./lib/gomoku"
import { waitForDraw } from "./lib/utils"
import GoBoard from "./go-board"

const gomokuMatch = new Match(gomoku)

export default {
    name: "GomokuSelfplayPane",
    components: { GoBoard },

    data() {
        return {
            isPlaying: false,
            message: "",
            black: { depth: 10 },
            white: { depth: 10 },
            board: new Array(gomoku.rows * gomoku.cols).fill(-1),
            abortController: null,
        }
    },

    computed: {
        cols() {
            return gomoku.cols
        },
        rows() {
            return gomoku.rows
        },
    },

    beforeDestroy() {
        this.abort()
    },

    methods: {
        async play() {
            this.isPlaying = true
            this.abortController = new AbortController()
            try {
                const playerB = new Agent({
                    rule: gomoku,
                    maxThinkingTime: {
                        type: "count",
                        value: Number(this.black.depth) || 10,
                    },
                })
                const playerW = new Agent({
                    rule: gomoku,
                    maxThinkingTime: {
                        type: "count",
                        value: Number(this.white.depth) || 10,
                    },
                })
                const result = await gomokuMatch.play({
                    players: [playerB, playerW],
                    signal: this.abortController.signal,
                    onThinkStart: this.onThinkStart,
                })

                this.board = result.board.slice(0)
                this.message =
                    result.winner === 0
                        ? "黒の勝ちです。"
                        : result.winner === 1
                            ? "白の勝ちです。"
                            : "引き分けです。"
            } catch (err) {
                if (err.message === "aborted") {
                    this.message = "中止しました。"
                } else {
                    this.message = `エラーが発生しました。\n${err.message}`
                }
            } finally {
                this.isPlaying = false
                this.abortController = null
            }
        },

        abort() {
            if (this.abortController) {
                this.abortController.abort()
            }
        },

        onThinkStart(state) {
            const playerName = state.playerTurn === 0 ? "黒" : "白"
            this.board = state.board.slice(0)
            this.message = `${playerName} 思考中...`
            return waitForDraw()
        },
    },
}
</script>

<style>
.gomoku-selfplay-pane-root {
    padding: 16px;
    border: 1px inset gray;
    border-radius: 3px;
    background: #eee;
}

.gomoku-selfplay-pane-settings label {
    display: inline-block;
}
.gomoku-selfplay-pane-settings label > input {
    width: 4em;
    text-align: right;
}
.gomoku-selfplay-pane-settings label:not(:last-child)::after {
    display: inline-block;
    content: "|";
    padding: 0 0.5em;
}
.gomoku-selfplay-pane-settings button {
    margin: 8px 8px 0 0;
}

.gomoku-selfplay-pane-container {
    position: relative;
    margin: 0;
    margin-top: 16px;
}

.gomoku-selfplay-pane-dialog {
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
.gomoku-selfplay-pane-dialog-message {
    font-weight: bold;
    margin-bottom: 8px;
}
</style>
