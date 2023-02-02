export interface AtomicAssetState {
    description?: string;
    owner?: string;
    symbol: string;
    name?: string;
    decimal: number;
    totalSupply: number;
    balances: Record<string, number>;
    allowances: Record<string, Record<string, number>>;

    evolve?: string;
    canEvolve?: boolean;
}

export type WriteResult = {
    state: AtomicAssetState
};
