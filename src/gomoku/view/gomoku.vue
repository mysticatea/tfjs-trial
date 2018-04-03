<template>
    <div class="gomoku-root">
        <table class="gomoku-board" @mousemove.passive="onMouseMove" @click.left.passive="onClick">
            <tr v-for="y in rows" :key="`R${y}`">
                <td v-for="x in cols" :key="`C${x}`" :data-action="cols * (y - 1) + (x - 1)">
                    <div
                        :class="{
                            'black': board[cols * (y - 1) + (x - 1)] === black,
                            'white': board[cols * (y - 1) + (x - 1)] === white,
                            'focus-black': input.focus === cols * (y - 1) + (x - 1) && input.player === black,
                            'focus-white': input.focus === cols * (y - 1) + (x - 1) && input.player === white,
                        }"
                        class="gomoku-stone" />
                </td>
            </tr>
        </table>
        <div v-if="mode === 'init'" class="gomoku-dialog">
            <div>{{ message }}</div>
            <div>
                <button @click.left="play">対戦する</button>
                <button @click.left="lean">学習する</button>
            </div>
        </div>
        <div v-if="mode === 'await'" class="gomoku-dialog">
            <div>{{ message }}</div>
        </div>
    </div>
</template>

<script>
import { Agent, DelegatePlayer, Match, PlayerTurn, Training } from "../../ai"
import { gomoku } from "../model/game"

const gomokuMatch = new Match(gomoku)

export default {
    data() {
        return {
            mode: "init",
            message: "AlphaZero 五目並べ",
            rows: gomoku.rows,
            cols: gomoku.cols,
            black: PlayerTurn.Black,
            white: PlayerTurn.White,
            board: new Array(gomoku.rows * gomoku.cols).fill(0),
            input: {
                resolve: null,
                player: -1,
                focus: -1,
                allowedActions: [],
            },
        }
    },

    methods: {
        async play() {
            const playerB = new DelegatePlayer(this.onPlayerActionStart)
            const playerW = Agent.new({ rule: gomoku })
            const result = await gomokuMatch.play(playerB, playerW, {
                onThinkStart: state => {
                    if (state.playerTurn === PlayerTurn.White) {
                        this.board = state.board.slice(0)
                        this.message = "AlphaZero 思考中..."
                        this.mode = "await"
                    } else {
                        this.mode = "play"
                    }
                    return new Promise(requestAnimationFrame)
                },
            })

            this.board = result.board.slice(0)
            this.message =
                result.winner === PlayerTurn.Black
                    ? "あなたの勝ちです。"
                    : result.winner === PlayerTurn.White
                        ? "AlphaZero の勝ちです。"
                        : "引き分けです。"
            this.mode = "init"
        },

        async lean() {
            const training = new Training({ rule: gomoku })
            await training.train()
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
    },
}
</script>

<style>
.gomoku-root {
    position: relative;
}

.gomoku-board {
    width: 90%;
    max-width: 800px;
    border-collapse: collapse;
    background: url(wood.png) repeat;
}
.gomoku-board td {
    padding: 8px;
    border: 1px solid gray;
}

.gomoku-stone {
    visibility: hidden;
    pointer-events: none;
    width: 90%;
    height: 90%;
    box-sizing: border-box;
    border: 1px solid gray;
    border-radius: 50%;
}
.gomoku-stone::before {
    display: block;
    content: "";
    padding-top: 100%;
}

.gomoku-stone.black,
.gomoku-stone.focus-black {
    visibility: visible;
    background-color: black;
}

.gomoku-stone.white,
.gomoku-stone.focus-white {
    visibility: visible;
    background-color: white;
}

.gomoku-stone.focus-black,
.gomoku-stone.focus-white {
    opacity: 0.5;
}

.gomoku-dialog {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    padding: 32px;
    box-sizing: border-box;
    background: rgba(255, 255, 255, 0.75);
}
</style>
