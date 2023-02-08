export interface AtomicAssetState {
    name?: string;
    description?: string;
    owner?: string;
    symbol: string;
    decimals: number;
    totalSupply: number;
    balances: Record<string, number>;
    allowances: Record<string, Record<string, number>>;
}

export type WriteResult = {
    state: AtomicAssetState
};
