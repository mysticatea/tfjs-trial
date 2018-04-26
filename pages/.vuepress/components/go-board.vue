<template>
    <svg :viewBox="svgViewBox" class="go-board-root" @mousemove="onMouseMove" @click.left="onClick">
        <path :d="gridPath" fill="none" stroke="#000" stroke-width="2" stroke-linecap="butt" />
        <template v-for="y in rows">
            <circle
                v-for="x in cols"
                :key="`R${y}C${x}`"
                :class="stoneClass(x, y)"
                :data-action="index(x, y)"
                :cx="fx((x - 0.5) * svgWidth / cols, x)"
                :cy="fy((y - 0.5) * svgHeight / rows, y)"
                :r="stoneRadius" />
        </template>
    </svg>
</template>

<script>
import * as d3 from "d3-path"

export default {
    name: "GoBoard",

    props: {
        board: {
            type: Array,
            default() {
                return []
            },
        },
        playerTurn: {
            type: Number,
            default: -1,
        },
        allowedActions: {
            type: Array,
            default() {
                return []
            },
        },
        rows: {
            type: Number,
            default: 19,
            validator(value) {
                return Number.isInteger(value) && value >= 2
            },
        },
        cols: {
            type: Number,
            default: 19,
            validator(value) {
                return Number.isInteger(value) && value >= 2
            },
        },
        svgWidth: {
            type: Number,
            default: 1024,
            validator(value) {
                return value >= 1
            },
        },
        svgHeight: {
            type: Number,
            default: 1024,
            validator(value) {
                return value >= 1
            },
        },
    },

    data() {
        return {
            focus: -1,
        }
    },

    computed: {
        svgViewBox() {
            return `0 0 ${this.svgWidth} ${this.svgHeight}`
        },

        stoneRadius() {
            return (
                (0.35 *
                    Math.min(
                        this.svgWidth / this.cols,
                        this.svgHeight / this.rows,
                    )) |
                0
            )
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
            const width = this.svgWidth
            const height = this.svgHeight
            const rows = this.rows
            const cols = this.cols
            const dx = width / rows
            const dy = height / cols
            const x0 = (dx / 2) | 0
            const y0 = (dy / 2) | 0
            const x1 = (width - dx / 2) | 0
            const y1 = (height - dy / 2) | 0
            const path = d3.path()

            for (let i = 0; i < cols; ++i) {
                const x = (x0 + i * dx) | 0
                path.moveTo(x, y0)
                path.lineTo(x, y1)
            }
            for (let i = 0; i < rows; ++i) {
                const y = (y0 + i * dy) | 0
                path.moveTo(x0, y)
                path.lineTo(x1, y)
            }

            return path.toString()
        },
    },

    watch: {
        allowedActions() {
            this.focus = -1
        },
    },

    methods: {
        onMouseMove(e) {
            const action = Number(e.target.dataset.action || "-1")
            if (this.focus !== action && this.allowedActions.includes(action)) {
                this.focus = action
            }
        },

        onClick(e) {
            const action = Number(e.target.dataset.action || "-1")
            if (this.allowedActions.includes(action)) {
                this.$emit("putstone", action)
            }
        },

        index(x, y) {
            return this.cols * (y - 1) + (x - 1)
        },

        stoneClass(x, y) {
            const { board, focus } = this
            const index = this.index(x, y)
            const focused = focus === index
            return {
                "go-board-stone": true,
                "go-board-stone-black": board[index] === 0 || focused,
                "go-board-stone-white": board[index] === 1 || focused,
                "go-board-stone-focus": focused,
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
.go-board-root {
    width: 100%;
    border: 1px outset gray;
    background: url(./wood.png) repeat;
}

.go-board-stone {
    fill: transparent;
    stroke: none;
}
.go-board-stone-black {
    fill: black;
    stroke: gray;
}
.go-board-stone-white {
    fill: white;
    stroke: gray;
}
.go-board-stone-focus {
    opacity: 0.5;
}
</style>
