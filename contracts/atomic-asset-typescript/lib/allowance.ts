import { getOr, getCaller, Result, isAddress, isUInt } from "./utils";
import { AtomicAssetState, WriteResult } from "./faces";
import { ContractErrors } from "./error";

export type AllowanceResult = {
    result: {
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
 * @returns allowanceResult {@link AllowanceResult}
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
 * @returns updated state {@link state}
 */
export function approve(state: AtomicAssetState, spender: string, amount: number): WriteResult {
    const caller = getCaller();
    isAddress(spender, "spender");
    isUInt(amount, "amount");

    return _approve(state, caller, spender, amount);
}

/**
 * Atomically decrease allowance. Mitigate vector attack from {@link allowance}
 * @param state mutable state of contract
 * @param spender spender
 * @param amountToSubtract amount to subtract from current allowance
 * @returns updated state {@link state}
 */
export function decreaseAllowance(state: AtomicAssetState, spender: string, amountToSubtract: number): WriteResult {
    const caller = getCaller();
    isAddress(spender, "spender");
    isUInt(amountToSubtract, "amountToSubtract");

    const { result: { allowance: currentAllowance } } = allowance(state, caller, spender);

    if (amountToSubtract > currentAllowance) {
        throw ContractErrors.AllowanceHasToGtThenZero();
    }

    return _approve(state, caller, spender, currentAllowance - amountToSubtract);
}

/**
 * Atomically decrease allowance. Mitigate vector attack from {@link allowance}
 * @param state mutable state of contract
 * @param spender spender
 * @param amountToSubtract amount to subtract from current allowance
 * @returns updated state {@link state}
 */
export function increaseAllowance(state: AtomicAssetState, spender: string, amountToAdd: number): WriteResult {
    const caller = getCaller();
    isAddress(spender, "spender");
    isUInt(amountToAdd, "amountToAdd");

    const { result: { allowance: currentAllowance } } = allowance(state, caller, spender);

    return _approve(state, caller, spender, currentAllowance + amountToAdd);
}

/**
 * Potential attack vector - https://docs.google.com/document/d/1YLPtQxZu1UAvO9cZ1O2RPXBbT0mooh4DYKjA_jp-RLM/edit
 * Sets amount as the allowance of spender over the caller’s tokens.
 * @param state mutable state of contract
 * @param owner owner or partial owner of asset
 * @param spender spender
 * @param amount amount to be approved to `transferFrom` by spender
 * @returns updated state {@link state}
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
