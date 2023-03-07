import { AtomicAssetState } from "./faces"
import { isAddress, Result } from "./utils"

export type BalanceOfResult = {
    result: {
        balance: string,
        target: string
    }
}

/**
 * Returns the amount of tokens owned by `target`.
 * @param state this contract mutable state
 * @param target
 * @returns balance of `target`
 */
export function balanceOf(state: AtomicAssetState, target: string) {
    isAddress(target, "target");

    return Result({
        balance: state.balances[target] ?? 0,
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
export function totalSupply(state: AtomicAssetState): TotalSupplyResult {
    return Result({
        value: state.totalSupply
    })
}

export type OwnerResult = {
    result: {
        value?: string
    }
}

/**
 * 
 * @param state this contract mutable state
 * @returns owner of the asset
 */
export function owner(state: AtomicAssetState): OwnerResult {
    return Result({
        value: state.owner
    })
}
