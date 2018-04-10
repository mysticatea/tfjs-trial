export function sample<T>(array: T[], count: number): T[] {
    const len = array.length
    if (len <= count << 2) {
        return shuffle(array, count)
    }

    const ret = new Array<T>(count)
    const used = new Set<number>()
    let i = 0
    let j = 0
    while (i < count) {
        do {
            j = (Math.random() * len) | 0
        } while (used.has(j))

        used.add(j)
        ret[i++] = array[j]
    }

    return ret
}

function shuffle<T>(array: T[], count: number): T[] {
    const len = array.length
    const ret = array.slice(0)

    for (let i = len <= count ? len - 1 : count; i > 0; --i) {
        const j = (Math.random() * len) | 0
        const temp = ret[i]
        ret[i] = ret[j]
        ret[j] = temp
    }
    if (len > count) {
        ret.length = count
    }

    return ret
}
