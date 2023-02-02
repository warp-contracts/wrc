import { getOr, get, Result, isAddress, isNonNegInt } from "./utils";
import { AtomicAssetState, WriteResult } from "./faces";

export type AllowanceResult = {
    result: {
        ticker: string,
        allowance: number,
        owner: string,
        spender: string
    }
}

/**
 * Returns the remaining number of tokens that spender will be allowed to spend on behalf of owner through transferFrom. This is zero by default.
 * This value changes when approve or transferFrom are called.
 * @param state mutable state of contract
 * @param owner
 * @param spender 
 * @returns 
 */
export function allowance(state: AtomicAssetState, owner: string, spender: string): AllowanceResult {
    isAddress(owner, "owner");
    isAddress(spender, "spender");

    const allowance = getOr(
        getOr(
            state.allowances[owner], {}
        )[spender]
        ,
        0)

    return Result({
        ticker: state.symbol,
        allowance,
        owner,
        spender
    })
}
/**
 * Potential attack vector - https://docs.google.com/document/d/1YLPtQxZu1UAvO9cZ1O2RPXBbT0mooh4DYKjA_jp-RLM/edit
 * Sets amount as the allowance of spender over the caller’s tokens.
 * @param state mutable state of contract
 * @param spender spender
 * @param amount amount to be approved to `transferFrom` by spender
 * @returns 
 */
export function approve(state: AtomicAssetState, spender: string, amount: number): WriteResult {
    const caller = get(SmartWeave.caller);
    isAddress(spender, "spender");
    isNonNegInt(amount, "amount");

    return _approve(state, caller, spender, amount);
}

/**
 * Potential attack vector - https://docs.google.com/document/d/1YLPtQxZu1UAvO9cZ1O2RPXBbT0mooh4DYKjA_jp-RLM/edit
 * Sets amount as the allowance of spender over the caller’s tokens.
 * @param state mutable state of contract
 * @param owner owner or partial owner of asset
 * @param spender spender
 * @param amount amount to be approved to `transferFrom` by spender
 * @returns 
 */
export function _approve(state: AtomicAssetState, owner: string, spender: string, amount: number): WriteResult {
    if (amount > 0) {
        const ownerAllowance = getOr(state.allowances[owner], {});

        state.allowances[owner] = {
            ...ownerAllowance,
            [spender]: amount
        }
    } else { // pruning
        const ownerAllowance = state.allowances[owner]
        if (!ownerAllowance) {
            return { state };
        }
        delete state.allowances[owner][spender]

        if (Object.keys(ownerAllowance).length === 0) {
            delete state.allowances[owner]
        }
    }

    return { state };
}
