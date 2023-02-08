export function getOr<T = any>(value: T, defaultVal: T): T {
    if (value) {
        return value;
    }

    return defaultVal;
}

export function get(value: any) {
    if (!value) {
        throw new ContractError(`Undefined value!`);
    }

    return value;
}

export function Result(data: any) {
    return { result: data };
}
export const isAddress = (value: unknown, name: string) => {
    if (!(typeof value === 'string' && value !== '')) {
        throw new ContractError(`Validation error: "${name}" has to be non-empty string`);
    }
}
export const isUInt = (value: unknown, name: string) => {
    if (!(typeof value === 'number' && Number.isSafeInteger(value) && !Number.isNaN(value) && value >= 0)) {
        throw new ContractError(`Validation error: "${name}" has to be integer and >= 0`);
    }
}

