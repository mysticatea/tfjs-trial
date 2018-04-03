import Vue from "vue"
import Gomoku from "./gomoku/view/gomoku.vue"

const app = new Vue({
    render(h) {
        return h(Gomoku)
    },
})

app.$mount("#main")
