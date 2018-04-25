import { GameState } from "../ai"

export class GomokuState implements GameState {
    readonly id: string
    readonly playerTurn: number
    readonly winner: number
    readonly board: ReadonlyArray<number>
    readonly actions: ReadonlyArray<number>

    constructor(
        id: string,
        playerTurn: number,
        winner: number,
        board: ReadonlyArray<number>,
        actions: ReadonlyArray<number>,
    ) {
        this.id = id
        this.playerTurn = playerTurn
        this.winner = winner
        this.board = board
        this.actions = actions
    }

    getStateData(outData: Float32Array): void {
        const myTurn = this.playerTurn
        const otherTurn = myTurn ^ 0x01
        const board = this.board
        const offset = board.length

        for (let i = 0; i < board.length; ++i) {
            switch (board[i]) {
                case myTurn:
                    outData[i] = 1
                    break
                case otherTurn:
                    outData[offset + i] = 1
                    break

                // no default
            }
        }
    }
}
