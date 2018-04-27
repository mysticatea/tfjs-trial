import { GomokuRule } from "./game-rule"
import { GomokuState } from "./game-state"

export { GomokuRule, GomokuState }
export const gomoku = Object.freeze(new GomokuRule())
export const weights = Object.freeze([undefined])
