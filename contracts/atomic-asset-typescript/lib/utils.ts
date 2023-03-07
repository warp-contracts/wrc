import { ContractErrors } from "./error";

export function getOr<T = any>(value: T, defaultVal: T): T {
    if (value) {
        return value;
    }

    return defaultVal;
}

export function getCaller() {
    const mCaller = SmartWeave.caller;
    if (!mCaller) {
        throw ContractErrors.RuntimeError("SmartWeave.caller is undefined");
    }

    return mCaller;
}

export function Result(data: any) {
    return { result: data };
}
export const isAddress = (value: unknown, name: string) => {
    if (!(typeof value === 'string' && value !== '')) {
        throw ContractErrors.RuntimeError(`Validation error: "${name}" has to be non-empty string`);
    }
}
export const isUInt = (value: unknown, name: string) => {
    if (!(typeof value === 'number' && Number.isSafeInteger(value) && !Number.isNaN(value) && value >= 0)) {
        throw ContractErrors.RuntimeError(`Validation error: "${name}" has to be integer and >= 0`);
    }
}

