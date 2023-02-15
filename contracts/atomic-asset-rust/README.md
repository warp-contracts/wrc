# 🦀 Atomic Asset

This is a Warp standard for Atomic Asset contract. The idea of Atomic Asset is
that we create a single transaction with asset file, metadata and contract
itself. One id points to both - contract and asset. The asset is put in the data
field of the contract and initial state is put ij the tags (by default initial
state is placed in the data field).

## Install dependencies

Run: `yarn`

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

All of the testing scripts should be invoked with a `--network` parameter
specifying one of the 3 possible networks:

- mainnet
- testnet
- local

## Functions

- [`deployAtomicAsset`](#deployatomicAsset)
- [`connectAtomicAsset`](#connectatomicAsset)
- [`balanceOf`](#balanceof)
- [`totalSupply`](#totalsupply)
- [`allowance`](#allowance)
- [`currentState`](#currentstate)
- [`transfer`](#transfer)
- [`transferFrom`](#transferfrom)
- [`approve`](#approve)

#### `deployAtomicAsset`

```typescript
async function deployAtomicAsset(
  Warp: Warp,
  initialState: AtomicAssetState,
  ownerWallet: ArWallet,
): Promise<[AtomicAssetState, ContractDeploy]>;
```

Deploys Atomic Asset contract.

#### `connectAtomicAsset`

```typescript
export async function connectAtomicAsset(
  Warp: Warp,
  contractTxId: string,
  wallet: ArWallet,
): Promise<AtomicAssetContract>;
```

Connects to Atomic Asset contract.

#### `balanceOf`

```typescript
async function balanceOf(target: string): Promise<BalanceResult>;
```

Returns the current balance for the given wallet.

```typescript
interface BalanceResult {
  balance: number;
  target: string;
}
```

- `target` - target for balance

<details>
  <summary>Example</summary>

```typescript
const result = await contract.balanceOf("ADDRESS_ID");
```

</details>

#### `totalSupply`

```typescript
async function totalSupply(): Promise<TotalSupplyResult>;
```

Returns the total supply of tokens.

```typescript
interface TotalSupplyResult {
  value: number;
}
```

<details>
  <summary>Example</summary>

```typescript
const result = await contract.totalSupply();
```

</details>

#### `allowance`

```typescript
async function allowance(
  owner: string,
  spender: string,
): Promise<AllowanceResult>;
```

Returns the amount which `spender` is allowed to withdraw from `owner`.

```typescript
interface AllowanceResult {
  owner: string;
  spender: string;
  allowance: number;
}
```

- `owner` - wallet address from which `spender` can withdraw the tokens
- `spender` - wallet address allowed to withdraw tokens from `owner`

<details>
  <summary>Example</summary>

```typescript
const result = await contract.allowance(
  "OWNER_ADDRESS_ID",
  "CONTRACT_ADDRESS_ID",
);
```

</details>

#### `currentState`

```typescript
async function currentState(): Promise<ERC20State>;
```

Returns the current contract state.

```typescript
interface ERC20State {
  symbol: string;
  name: string;
  decimals: number;
  totalSupply: number;
  balances: {
    [key: string]: number;
  };
  allowances: {
    [owner: string]: {
      [spender: string]: number;
    };
  };
  settings: any[] | unknown | null;
  owner: string;
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
async function transfer(
  transfer: TransferInput,
): Promise<WriteInteractionResponse | null>;
```

Allows to transfer tokens between wallets.

```typescript
interface TransferInput {
  to: string;
  amount: number;
}
```

- `to` - target wallet address
- `amount` - amount of tokens to be transferred

<details>
  <summary>Example</summary>

```typescript
const result = await contract.transfer("TO_ADDRESS", 100);
```

</details>

#### `transferFrom`

```typescript
async function transferFrom(
  transfer: TransferFromInput,
): Promise<WriteInteractionResponse | null>;
```

Allows transferring tokens using the allowance mechanism.

```typescript
interface TransferFromInput {
  from: string;
  to: string;
  amount: number;
}
```

- `from` - wallet address to transfer from
- `to` - target wallet address
- `amount` - amount of tokens to be transferred

<details>
  <summary>Example</summary>

```typescript
const result = await contract.transferFrom("FROM_ADDRESS", "TO_ADDRESS", 100);
```

</details>

#### `approve`

```typescript
async function approve(
  transfer: ApproveInput,
): Promise<WriteInteractionResponse | null>;
```

Approves tokens to be spent by another account between wallets.

```typescript
interface ApproveInput {
  spender: string;
  amount: number;
}
```

- `spender` - wallet address allowed to spend another wallet address tokens
- `amount` - amount of tokens allowed to be spent

<details>
  <summary>Example</summary>

```typescript
const result = await contract.approve("SPENDER_ADDRESS", 100);
```

</details>
