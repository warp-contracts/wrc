import { allowance, _approve } from "./allowance";
import { getCaller, getOr, isAddress, isUInt } from "./utils";
import { AtomicAssetState, WriteResult } from "./faces";
import { ContractErrors } from "./error";

/**
 * Moves `amount` tokens from the caller’s account to `to`.
 * If `to` `new balance == totalSupply => state.owner = to`
 * @param state this contract mutable state
 * @param to receiver of transfer
 * @param amount how much  we want to transfer
 * @returns updated state {@link state}
 */
export function transfer(state: AtomicAssetState, to: string, amount: number): WriteResult {
    const from = getCaller();
    isAddress(to, "to");
    isUInt(amount, "amount");

    return _transfer(state, from, to, amount);
}

/**
 * Moves `amount` tokens from sender to `to` using the allowance mechanism.
 * Fails if `allowance < amount`
 * If `to` `new balance == totalSupply => state.owner = to`
 * @param state this contract mutable state
 * @param from From which account we want to transfer asset
 * @param to receiver of transfer
 * @param amount how much of Asset we want to transfer, if amount == totalSupply we are transferring whole Asset
 * @returns updated state {@link state}
 */
export function transferFrom(state: AtomicAssetState, from: string, to: string, amount: number): WriteResult {
    const caller = getCaller();
    isAddress(to, "to");
    isAddress(from, "from");
    isUInt(amount, "amount");

    const { result: { allowance: allowed } } = allowance(state, from, caller);

    if (allowed < amount) {
        throw ContractErrors.CallerAllowanceNotEnough(allowed);
    }

    _approve(state, from, caller, allowed - amount);

    return _transfer(state, from, to, amount)
}

/**
 * Moves `amount` tokens from the caller’s account to `to`.
 * If `to` `new balance == totalSupply => state.owner = to`
 * @param from From which account we want to transfer asset
 * @param state this contract mutable state
 * @param to receiver of transfer
 * @param amount how much  we want to transfer
 * @returns updated state {@link state}
 */
export function _transfer(state: AtomicAssetState, from: string, to: string, amount: number): WriteResult {
    const balances = state.balances;

    const fromBalance = getOr(balances[from], 0);

    if (fromBalance < amount) {
        throw ContractErrors.CallerBalanceNotEnough(fromBalance);
    }

    const newFromBalance = fromBalance - amount;

    if (newFromBalance === 0) {
        delete balances[from];
    } else {
        balances[from] = newFromBalance;
    }

    let toBalance = getOr(balances[to], 0);

    balances[to] = toBalance + amount;

    _claimOwnership(state, from);
    _claimOwnership(state, to);

    return { state };
}

function _claimOwnership(state: AtomicAssetState, potentialOwner: string) {
    const currentBalance = getOr(state.balances[potentialOwner], 0);

    if (currentBalance === state.totalSupply) {
        state.owner = potentialOwner;
    } else if (state.owner && currentBalance > 0) {
        state.owner = null;
    }
}

