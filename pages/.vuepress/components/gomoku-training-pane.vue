<template>
    <training-pane :rule="gomoku" />
</template>

<script>
import TrainingPane from "./training-pane.vue"
import { gomoku } from "./lib/gomoku"

export default {
    name: "GomokuTrainingPane",
    components: { TrainingPane },

    computed: {
        gomoku() {
            return gomoku
        },
    },
}
</script>

<style>
</style>
