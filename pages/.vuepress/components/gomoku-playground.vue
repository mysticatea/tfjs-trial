<template>
    <div class="gomoku-playground-root">
        <!-- メニュー -->
        <div class="gomoku-playground-settings">
            <agent-config
                v-model="black"
                :weights="weights"
                :disabled="isPlaying"
                class="gomoku-playground-agent-config" />
            <agent-config
                v-model="white"
                :weights="weights"
                :disabled="isPlaying"
                class="gomoku-playground-agent-config" />
            <div>
                <button v-if="isPlaying" @click="abort">❌ 中止する</button>
                <button v-else @click="play">▶️ 開始する</button>
                <span v-show="message" class="gomoku-playground-message">{{ message }}</span>
            </div>
        </div>
        <!-- 碁盤 -->
        <go-board
            :board="board"
            :player-turn="playerTurn"
            :allowed-actions="allowedActions"
            :rows="rows"
            :cols="cols"
            @putstone="onPutStone" />
    </div>
</template>

<script>
import { AbortController } from "abort-controller"
import { Agent, DelegatePlayer, Match } from "./lib/ai"
import { gomoku, weights } from "./lib/gomoku"
import { waitForDraw } from "./lib/utils"
import AgentConfig from "./agent-config"
import GoBoard from "./go-board"

const gomokuMatch = new Match(gomoku)

export default {
    name: "GomokuPlayground",
    components: { AgentConfig, GoBoard },

    data() {
        return {
            weights,
            black: {
                manual: true,
                weights: undefined,
                depth: 5,
            },
            white: {
                manual: false,
                weights: weights[weights.length - 1],
                depth: 5,
            },

            isPlaying: false,
            abortController: null,
            message: "",
            board: new Array(gomoku.rows * gomoku.cols).fill(-1),
            playerTurn: -1,
            allowedActions: [],
            sendAction: null,
            abortAction: null,
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
                const playerB = this.createPlayer(this.black)
                const playerW = this.createPlayer(this.white)
                const result = await gomokuMatch.play({
                    players: [playerB, playerW],
                    signal: this.abortController.signal,
                    onThinkStart: this.onThinkStart,
                })

                this.board = result.board.slice(0)
                this.playerTurn = -1
                this.allowedActions = []
                this.message =
                    result.winner === 0
                        ? "黒番の勝ちです。"
                        : result.winner === 1
                            ? "白番の勝ちです。"
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
            if (this.abortAction) {
                this.abortAction()
            }
            if (this.abortController) {
                this.abortController.abort()
            }
        },

        createPlayer(config) {
            if (config.manual) {
                return new DelegatePlayer(this.onPlayerActionStart)
            }
            return new Agent({
                rule: gomoku,
                serializedModel: config.weights,
                maxThinkingTime: {
                    type: "count",
                    value: config.depth,
                },
            })
        },

        onPlayerActionStart(state, resolve, reject) {
            this.message = "あなたの番です。"
            this.board = state.board.slice(0)
            this.playerTurn = state.playerTurn
            this.allowedActions = state.actions.slice(0)
            this.sendAction = action => {
                this.playerTurn = -1
                this.allowedActions = []
                this.sendAction = null
                this.abortAction = null
                resolve(gomoku.takeAction(state, action))
            }
            this.abortAction = () => {
                this.playerTurn = -1
                this.allowedActions = []
                this.sendAction = null
                this.abortAction = null
                reject(new Error("aborted"))
            }
        },

        onThinkStart(state) {
            const config = state.playerTurn === 0 ? this.black : this.white
            if (!config.manual) {
                this.board = state.board.slice(0)
                this.message = "AlphaZero 思考中..."
                return waitForDraw()
            }
            return undefined
        },

        onPutStone(action) {
            if (this.sendAction && this.allowedActions.includes(action)) {
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

.gomoku-playground-settings button {
    margin: 16px 8px 16px 0;
    font-size: 1rem;
}

.gomoku-playground-agent-config:nth-child(1)::before {
    display: inline-block;
    content: "黒番:";
    margin-right: 8px;
}
.gomoku-playground-agent-config:nth-child(2)::before {
    display: inline-block;
    content: "白番:";
    margin-right: 8px;
}

.gomoku-playground-message {
    display: inline-block;
    padding: 2px 8px;
    border: 1px solid gray;
    border-radius: 3px;
    background: white;
    font-size: 1rem;
}
</style>
