import { allowance, approve } from "../lib/allowance";
import { balanceOf, totalSupply } from "../lib/balance";
import { AtomicNFTState } from "../lib/faces";
import { transfer, transferFrom } from "../lib/transfer";

type Action = {
    input: Record<string, string | number>
}

export function handle(state: AtomicNFTState, action: Action) {
    validate(action);
    // we are after validation, so we can safely cast
    const input = action.input as Record<string, any>;

    switch (action.input.function) {
        case FUNCTIONS.TRANSFER:
            return transfer(state, input.to, input.amount);
        case FUNCTIONS.TRANSFER_FROM:
            return transferFrom(state, input.from, input.to, input.amount);
        case FUNCTIONS.APPROVE:
            return approve(state, input.spender, input.amount);
        case FUNCTIONS.ALLOWANCE:
            return allowance(state, input.owner, input.spender);
        case FUNCTIONS.BALANCE_OF:
            return balanceOf(state, input.target);
        case FUNCTIONS.TOTAL_SUPPLY:
            return totalSupply(state);
    }

}

const isAddress = (value: unknown) => typeof value === 'string' && value !== '';
const isPositiveInt = (value: unknown) => typeof value === 'number' && Number.isSafeInteger(value) && !Number.isNaN(value) && value >= 0;

function validate(action: Action) {
    const func = action.input.function as SCHEMA_KEYS;
    const fnSchema = SCHEMA[func];

    if (!fnSchema) {
        throw new ContractError(`Function ${func} not supported`)
    }

    const errors = Object.keys(fnSchema)
        .filter(
            //@ts-ignore
            (key: string) => !fnSchema[key](action.input[key])
        )
        .map(key => `${key} is not valid`);

    if (errors.length !== 0) {
        throw new ContractError(`Validation error: ${errors.join('; ')}`)
    }
}

export enum FUNCTIONS {
    TRANSFER = 'transfer',
    TRANSFER_FROM = 'transferFrom',
    ALLOWANCE = 'allowance',
    APPROVE = 'approve',
    BALANCE_OF = 'balanceOf',
    TOTAL_SUPPLY = 'totalSupply'
}


const SCHEMA = {
    transfer: {
        to: isAddress,
        amount: isPositiveInt
    },
    transferFrom: {
        from: isAddress,
        to: isAddress,
        amount: isPositiveInt,
    },
    allowance: {
        owner: isAddress,
        spender: isAddress
    },
    approve: {
        spender: isAddress,
        amount: isPositiveInt,
    },
    balanceOf: {
        target: isAddress
    },
    totalSupply: {}
}
type SCHEMA_TYPE = typeof SCHEMA;
type SCHEMA_KEYS = keyof SCHEMA_TYPE;

