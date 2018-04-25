import Vue from "vue"

export function waitForDraw(): Promise<void> {
    return new Promise(resolve => Vue.nextTick(() => setTimeout(resolve, 0)))
}
