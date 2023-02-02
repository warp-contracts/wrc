import { AtomicNFTState } from "./faces"
import { isAddress, Result } from "./utils"

export type BalanceOfResult = {
    result: {
        balance: string,
        ticker: string,
        target: string
    }
}

/**
 * Returns the amount of tokens owned by `target`.
 * @param state this contract mutable state
 * @param target
 * @returns balance of `target`
 */
export function balanceOf(state: AtomicNFTState, target: string) {
    isAddress(target, "target");

    return Result({
        balance: state.balances[target] ?? 0,
        ticker: state.symbol,
        target
    })
}

export type TotalSupplyResult = {
    result: {
        value: number
    }
}

/**
 * Returns the amount of tokens in existence.
 * @param state this contract mutable state
 * @returns the amount of tokens in existence.
 */
export function totalSupply(state: AtomicNFTState): TotalSupplyResult {
    return Result({
        value: state.totalSupply
    })
}
