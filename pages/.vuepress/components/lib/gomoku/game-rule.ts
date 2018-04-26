import { GameRule } from "../ai"
import { GomokuState } from "./game-state"

const ROWS = 9
const COLS = 9
const THRESHOLD = 5
const stateMap = new Map<string, GomokuState>()
const initialBoard = Object.freeze(new Array(ROWS * COLS).fill(-1))

export class GomokuRule implements GameRule<GomokuState> {
    stateSize = [2, ROWS, COLS] as [number, number, number]
    actionSize = COLS * ROWS
    initialState = new GomokuState(
        toId(initialBoard),
        0,
        -1,
        new Array(ROWS * COLS).fill(-1),
        toAllowedActions(initialBoard),
    )
    rows = ROWS
    cols = COLS

    //eslint-disable-next-line class-methods-use-this
    takeAction(state: GomokuState, action: number): GomokuState {
        if (state.board[action] !== -1) {
            throw new Error("Invalid action")
        }

        const id = nextId(state.id, state.playerTurn, action)
        if (stateMap.has(id)) {
            return stateMap.get(id)!
        }

        const playerTurn = state.playerTurn ^ 0x01
        const board = state.board.slice(0)
        board[action] = state.playerTurn
        const winner = checkWin(board, action) ? state.playerTurn : -1
        const actions = winner !== -1 ? [] : toAllowedActions(board)
        const nextState = new GomokuState(
            id,
            playerTurn,
            winner,
            board,
            actions,
        )

        stateMap.set(id, nextState)
        return nextState
    }
}

function toId(board: ReadonlyArray<number>): string {
    let s = ""
    for (let i = 0; i < board.length; i += 2) {
        const n0 = board[i] & 0x03
        const n1 = board[i + 1] & 0x03

        s += ((n0 << 2) | n1).toString(16)
    }
    return s
}

function nextId(id: string, turn: number, action: number): string {
    const i = (action / 2) | 0
    const value = parseInt(id[i], 16)
    const n0 = action & 1 ? (value >> 2) & 0x03 : turn & 0x03
    const n1 = action & 1 ? turn & 0x03 : value & 0x03
    const c = ((n0 << 2) | n1).toString(16)

    return `${id.slice(0, i)}${c}${id.slice(i + 1)}`
}

function toAllowedActions(board: ReadonlyArray<number>): number[] {
    const actions = []
    for (let i = 0; i < board.length; ++i) {
        if (board[i] === -1) {
            actions.push(i)
        }
    }
    return actions
}

function checkWin(board: number[], startIndex: number): boolean {
    return (
        isSeq(board, startIndex, 1) ||
        isSeq(board, startIndex, COLS - 1) ||
        isSeq(board, startIndex, COLS) ||
        isSeq(board, startIndex, COLS + 1)
    )
}

function isSeq(board: number[], startIndex: number, delta: number): boolean {
    const expected = board[startIndex]

    let l = startIndex - delta
    while (l >= 0 && board[l] === expected) {
        l -= delta
    }

    let r = startIndex + delta
    while (r < board.length && board[r] === expected) {
        r += delta
    }

    const seq = (r - l) / delta - 1

    return seq >= THRESHOLD
}
