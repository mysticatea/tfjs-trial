<template>
    <div class="agent-config-root">
        <select v-model="weightIndex" :disabled="disabled">
            <option v-if="!noManual" :key="-1" value="-1">マウスで入力</option>
            <option v-for="(_model, i) of weights" :key="i" :value="i">
                第 {{ i }} 世代
            </option>
        </select>
        |
        <label>
            先読みレベル
            <input v-model="depth" :disabled="depthDisabled" type="number" min="1" max="99">
        </label>
    </div>
</template>

<script>
export default {
    name: "AgentConfig",

    model: {
        prop: "config",
        event: "change",
    },

    props: {
        weights: {
            type: Array,
            default() {
                return [undefined]
            },
            validator(value) {
                return value.length >= 1
            },
        },
        config: {
            type: Object,
            default() {
                return { weights: undefined, depth: 5 }
            },
            validator(value) {
                return (
                    typeof value === "object" &&
                    (typeof value.manual === "undefined" ||
                        typeof value.manual === "boolean") &&
                    (typeof value.weights === "undefined" ||
                        typeof value.weights === "string") &&
                    typeof value.depth === "number"
                )
            },
        },
        noManual: {
            type: Boolean,
            default: false,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    },

    data() {
        const manual = !this.noManual && Boolean(this.config.manual)
        const weightIndex = manual
            ? -1
            : this.weights.indexOf(this.config.weights)
        const depth = Number(this.config.depth) || 5
        return { weightIndex, depth }
    },

    computed: {
        depthDisabled() {
            return this.disabled || this.weightIndex === -1
        },
    },

    watch: {
        config(value) {
            const manual = !this.noManual && Boolean(value.manual)
            this.weightIndex = manual ? -1 : this.weights.indexOf(value.weights)
            this.depth = value.depth
        },

        weightIndex(value) {
            const manual = this.noManual ? undefined : value == -1 //eslint-disable-line eqeqeq
            const weights = manual ? undefined : this.weights[value]
            const depth = this.depth
            if (
                this.config.manual !== manual ||
                this.config.weights !== weights
            ) {
                this.$emit("change", { manual, weights, depth })
            }
        },

        depth(value) {
            const manual = this.noManual ? undefined : this.weightIndex === -1
            const weights = manual ? undefined : this.weights[this.weightIndex]
            const depth = Number(value) || 5
            if (this.config.depth !== depth) {
                this.$emit("change", { manual, weights, depth })
            }
        },
    },
}
</script>

<style>
.agent-config-root {
    padding: 2px 4px;
    font-size: 0.8em;
}

.agent-config-root select {
    padding-bottom: 4px;
}
.agent-config-root input[type="number"] {
    width: calc(2em + 16px);
    text-align: right;
}
</style>
