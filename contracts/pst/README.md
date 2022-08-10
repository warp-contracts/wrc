# 🦀 PST

This is a SmartWeave standard for PST contract. Profit sharing tokens (PST) are responsible for sharing the proceeds of any resources on Arweave. You can read some more about it in [Warp academy](https://academy.warp.cc/tutorials/pst/profit-sharing/profit-sharing-tokens). 

## Install dependencies

Run:
`yarn`

## Build contract

```
yarn build
```

## Run tests

```
yarn test
```

## Deploy and test contract on different networks

To run deploy and tests scripts run:

```
node scripts/[SCRIPT-NAME]
```

All of the testing scripts should be invoked with a `--network` parameter specifying one of the 3 possible networks:

- mainnet
- testnet
- local

## Functions

- [`pst`](#pst)
- [`currentBalance`](#currentBalance)
- [`currentState`](#currentstate)
- [`transfer`](#transfer)

#### `pst`

```typescript
export async function pst(contractTxId: string): PstContract;
```

Connects to PST contract.

<details>
  <summary>Example</summary>

```typescript
const pst = warp.pst(contractTxId).setEvaluationOptions({
  internalWrites: true,
});
```

</details>

#### `currentBalance`

```typescript
async function currentBalance(target: string): Promise<BalanceResult>;
```

Returns the current balance for the given wallet

```typescript
interface BalanceResult {
  balance: number;
  ticker: string;
  target: string;
}
```

- `target` - target for balance

<details>
  <summary>Example</summary>

```typescript
const result = await contract.currentBalance('ADDRESS_ID');
```

</details>

#### `currentState`

```typescript
async function currentState(): Promise<PstState>;
```

Returns the current contract state.

```typescript
interface PSTState {
  ticker: string;
  owner: string;
  balances: {
    [key: string]: number;
  };
  settings: any[] | unknown | null;
  canEvolve: boolean;
  evolve: string;
}
```

<details>
  <summary>Example</summary>

```typescript
const result = await contract.currentState();
```

</details>

#### `transfer`

```typescript
async function transfer(transfer: TransferInput): Promise<string | null>;
```

Allows to transfer tokens between wallets.

```typescript
interface TransferInput {
  target: string;
  qty: number;
}
```

- `target` - target wallet address
- `qty` - amount of tokens to be transferred

<details>
  <summary>Example</summary>

```typescript
const result = await contract.transfer('TARGET_ADDRESS', 100);
```

</details>
