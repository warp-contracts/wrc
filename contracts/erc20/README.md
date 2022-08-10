# RedStone SmartWeave ERC20

This repo contains Warp implementation of the ERC20 token contract standard. This standard allows creation of any tokens on Arweave blockchain. Standard provides basic functionality to transfer tokens, as well as allow tokens to be approved so they can be spent by another third party.

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

- [`deployERC20`](#deployERC20)
- [`connectERC20`](#connecterc20)
- [`balanceOf](#balanceof)
- [`totalSupply`](#totalsupply)
- [`allowance`](#allowance)
- [`currentState`](#currentstate)
- [`transfer`](#transfer)
- [`transferFrom`](#transferfrom)
- [`approve`](#approve)

#### `deployERC20`

```typescript
async function deployERC20(
  Warp: Warp,
  initialState: ERC20State,
  ownerWallet: ArWallet
): Promise<[ERC20State, ContractDeploy]>;
```

Deploys ERC20 contract.

#### `connectERC20`

```typescript
export async function connectERC20(Warp: Warp, contractTxId: string, wallet: ArWallet): Promise<ERC20Contract>;
```

Connects to ERC20 contract.

#### `balanceOf`

```typescript
async function balanceOf(target: string): Promise<BalanceResult>;
```

Returns the current balance for the given wallet.

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
const result = await contract.balanceOf('ADDRESS_ID');
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
async function allowance(owner: string, spender: string): Promise<AllowanceResult>;
```

Returns the amount which `spender` is allowed to withdraw from `owner`.

```typescript
interface AllowanceResult {
  ticker: string;
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
const result = await contract.allowance('OWNER_ADDRESS_ID', 'CONTRACT_ADDRESS_ID');
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
  canEvolve: boolean;
  evolve: string;
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
async function transfer(transfer: TransferInput): Promise<WriteInteractionResponse | null>;
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
const result = await contract.transfer('TO_ADDRESS', 100);
```

</details>

#### `transferFrom`

```typescript
async function transferFrom(transfer: TransferFromInput): Promise<WriteInteractionResponse | null>;
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
const result = await contract.transferFrom('FROM_ADDRESS', 'TO_ADDRESS', 100);
```

</details>

#### `approve`

```typescript
async function approve(transfer: ApproveInput): Promise<WriteInteractionResponse | null>;
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
const result = await contract.approve('SPENDER_ADDRESS', 100);
```

</details>
