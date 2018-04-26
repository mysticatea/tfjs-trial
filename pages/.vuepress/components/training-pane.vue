<template>
    <div class="training-pane-root">
        <div class="training-pane-settings">
            <button v-if="!isExecuting" @click="train">▶️ 開始する</button>
            <button v-else @click="abort">❌ 中止する</button>
            (
            <label>読みの深さ <input v-model="depth" :disabled="isExecuting" type="number"></label>
            <label>自己対戦回数 <input v-model="playingLoops" :disabled="isExecuting" type="number"></label>
            <label>更新処理回数 <input v-model="trainingLoops" :disabled="isExecuting" type="number"></label>
            )
        </div>
        <ol ref="container" class="training-pane-log-container">
            <li v-for="({type, message}, i) of messages" :key="i" :class="`training-pane-log-${type}`">
                {{ message }}
            </li>
        </ol>
    </div>
</template>

<script>
import Vue from "vue"
import { AbortController } from "abort-controller"
import { Training } from "./lib/ai"
import { waitForDraw } from "./lib/utils"

export default {
    name: "TrainingPane",

    props: {
        rule: {
            type: Object,
            required: true,
        },
    },

    data() {
        return {
            messages: [],
            playingLoops: 30,
            trainingLoops: 30,
            depth: 10,
            isExecuting: false,
            abortController: null,
        }
    },

    beforeDestroy() {
        this.abort()
    },

    methods: {
        async train() {
            this.isExecuting = true
            this.abortController = new AbortController()
            try {
                this.log("info", "強化学習を開始しました。")
                const training = new Training(this.rule)
                const result = await training.train({
                    playingLoops: Number(this.playingLoops) || 30,
                    trainingLoops: Number(this.trainingLoops) || 30,
                    maxThinkingTime: {
                        type: "count",
                        value: Number(this.depth) || 10,
                    },
                    signal: this.abortController.signal,
                    onEpisodeBegin: this.onEpisodeBegin,
                    onPlayBegin: this.onPlayBegin,
                    onPlayEnd: this.onPlayEnd,
                    onPlayStateChange: this.onPlayStateChange,
                    onTrainBegin: this.onTrainBegin,
                    onTrainEnd: this.onTrainEnd,
                })
                this.log("trace", result.finalSerializedModel)
                this.log("info", "強化学習を完了しました。")
            } catch (err) {
                if (err.message === "aborted") {
                    this.log("info", "中止しました。")
                } else {
                    this.log("error", err.stack)
                }
            } finally {
                this.isExecuting = false
                this.abortController = null
            }
        },

        abort() {
            if (this.abortController) {
                this.abortController.abort()
            }
        },

        onEpisodeBegin(episode) {
            return this.log("trace", `エピソード ${episode} を開始しました。`)
        },

        onPlayBegin(_episode, count) {
            return this.log(
                "trace",
                `自己対戦 ${count}/${this.playingLoops} を実行しています。`,
            )
        },
        onPlayEnd(_episode, _count, score) {
            return this.log("trace", `現在のスコア ${score.toFixed(3)}。`)
        },
        onPlayStateChange(_episode, _count) {
            return this.tick()
        },

        onTrainBegin(_episode, count) {
            return this.log(
                "trace",
                `ネットワーク更新 ${count}/${
                    this.trainingLoops
                } を実行しています。`,
            )
        },

        onTrainEnd(_episode, _count, epoch, history) {
            return this.log(
                "trace",
                `評価データ: ${JSON.stringify({ epoch, history })}`,
            )
        },

        async log(type, message) {
            console[type === "trace" ? "log" : type](message) //eslint-disable-line no-console
            this.messages.push({ type, message })

            await Vue.nextTick()

            const container = this.$refs.container
            container.scrollTop = Math.max(
                0,
                container.scrollHeight - container.clientHeight,
            )

            await new Promise(resolve => setTimeout(resolve, 0))
        },

        tick() {
            const lastMessage = this.messages[this.messages.length - 1]
            if (
                lastMessage &&
                lastMessage.type === "trace" &&
                /^\.+$/.test(lastMessage.message)
            ) {
                console.log(".") //eslint-disable-line no-console
                lastMessage.message += "."
                return waitForDraw()
            }
            return this.log("trace", ".")
        },
    },
}
</script>

<style>
.training-pane-root {
    padding: 16px;
    border: 1px inset gray;
    border-radius: 3px;
    background: #eee;
}

.training-pane-settings > label {
    display: inline-block;
}
.training-pane-settings > label > input {
    width: 4em;
    text-align: right;
}
.training-pane-settings > label:not(:last-child)::after {
    display: inline-block;
    content: "|";
    padding: 0 0.5em;
}

.training-pane-log-container {
    list-style: none;
    margin: 0;
    margin-top: 16px;
    padding: 0;
    height: 320px;
    max-height: 50%;
    overflow-y: scroll;
    border: 1px dotted gray;
    border-radius: 3px;
    background: white;
}
.training-pane-log-container > li {
    padding: 4px;
    font-size: 0.8em;
    font-family: monospace;
    word-wrap: break-word;
}
.training-pane-log-container > li:not(:first-child) {
    border-top: 1px dotted gray;
}

.training-pane-log-trace {
    color: #9e9e9e;
}
.training-pane-log-trace::before {
    display: inline-block;
    content: "ログ";
    width: 45px;
    border: 1px solid #9e9e9e;
    border-radius: 3px;
    color: #9e9e9e;
    background: #fafafa;
    text-align: center;
}
.training-pane-log-info {
    color: #000;
}
.training-pane-log-info::before {
    display: inline-block;
    content: "情報";
    width: 45px;
    border: 1px solid #2196f3;
    border-radius: 3px;
    color: #2196f3;
    background: #e3f2fd;
    text-align: center;
}
.training-pane-log-warn {
    color: #000;
}
.training-pane-log-warn::before {
    display: inline-block;
    content: "警告";
    width: 45px;
    border: 1px solid #ff9800;
    border-radius: 3px;
    color: #ff9800;
    background: #fff3e0;
    text-align: center;
}
.training-pane-log-error {
    color: #f44336;
}
.training-pane-log-error::before {
    display: inline-block;
    content: "エラー";
    width: 45px;
    border: 1px solid #f44336;
    border-radius: 3px;
    color: #f44336;
    background: #ffebee;
    text-align: center;
}
</style>
