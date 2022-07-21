# 🦀 Staking

This repo contains a sample Staking contract implemented to demonstrate the usual
approval -> transferFrom flow of tokens.

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

To run advanced mainnet scripts which demonstrate staking flow simply run:

```
yarn advanced:mainnet
```

...or follow these steps:

1. Deploy the erc20 contract:

```
node ./integration/deployERC20 --network mainnet
```

2. Deploy the staking contract:

```
node ./integration/deployStaking --network mainnet
```

3. Run sample script with approvals, staking and withdrawals:

```
node ./integration/approveAndStake --network mainnet
```
