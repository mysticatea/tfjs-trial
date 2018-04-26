<template>
    <div class="gomoku-playground-root">
        <!-- メニュー -->
        <div class="gomoku-playground-settings">
            <button :disabled="isPlaying" @click="play">▶️ 開始</button>
            ( <label>読みの深さ <input v-model="depth" :disabled="isPlaying" type="number" min="1" max="99"></label> )
        </div>
        <div class="gomoku-playground-container">
            <!-- 九路盤 -->
            <go-board
                :board="board"
                :player-turn="playerTurn"
                :allowed-actions="allowedActions"
                :rows="rows"
                :cols="cols"
                @putstone="onPutStone" />
            <!-- ダイアログ -->
            <div v-if="message" class="gomoku-playground-dialog">
                {{ message }}
            </div>
        </div>
    </div>
</template>

<script>
import { Agent, DelegatePlayer, Match } from "./lib/ai"
import { gomoku } from "./lib/gomoku"
import { waitForDraw } from "./lib/utils"
import GoBoard from "./go-board"

const gomokuMatch = new Match(gomoku)

export default {
    name: "GomokuPlayground",
    components: { GoBoard },

    data() {
        return {
            isPlaying: false,
            message: "",
            depth: 10,
            board: new Array(gomoku.rows * gomoku.cols).fill(-1),
            playerTurn: -1,
            allowedActions: [],
            sendAction: null,
        }
    },

    computed: {
        cols() {
            return gomoku.cols
        },
        rows() {
            return gomoku.rows
        },

        maxThinkingTime() {
            return {
                type: "count",
                value: Number(this.depth) || 10,
            }
        },
    },

    methods: {
        async play() {
            this.isPlaying = true
            try {
                const playerB = new DelegatePlayer(this.onPlayerActionStart)
                const playerW = new Agent({
                    rule: gomoku,
                    maxThinkingTime: this.maxThinkingTime,
                })
                const result = await gomokuMatch.play({
                    players: [playerB, playerW],
                    onThinkStart: this.onThinkStart,
                })

                this.board = result.board.slice(0)
                this.playerTurn = -1
                this.allowedActions = []
                this.message =
                    result.winner === 0
                        ? "あなたの勝ちです。"
                        : result.winner === 1
                            ? "AlphaZero の勝ちです。"
                            : "引き分けです。"
            } catch (err) {
                this.message = `エラーが発生しました。\n${err.message}`
            } finally {
                this.isPlaying = false
            }
        },

        onPlayerActionStart(state, resolve) {
            this.message = ""
            this.board = state.board.slice(0)
            this.playerTurn = state.playerTurn
            this.allowedActions = state.actions.slice(0)
            this.sendAction = action => {
                this.playerTurn = -1
                this.allowedActions = []
                this.sendAction = null
                resolve(gomoku.takeAction(state, action))
            }
        },

        onThinkStart(state) {
            if (state.playerTurn === 1) {
                this.board = state.board.slice(0)
                this.message = "AlphaZero 思考中..."
            }
            return waitForDraw()
        },

        onPutStone(action) {
            if (
                this.sendAction != null &&
                this.allowedActions.includes(action)
            ) {
                this.sendAction(action)
            }
        },
    },
}
</script>

<style>
.gomoku-playground-root {
    padding: 16px;
    border: 1px inset gray;
    border-radius: 3px;
    background: #eee;
}

.gomoku-playground-settings > label {
    display: inline-block;
}
.gomoku-playground-settings > label > input {
    width: 4em;
    text-align: right;
}
.gomoku-playground-settings > label:not(:last-child)::after {
    display: inline-block;
    content: "|";
    padding: 0 0.5em;
}

.gomoku-playground-container {
    position: relative;
    margin: 0;
    margin-top: 16px;
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
