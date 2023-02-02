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