# Warp Request for Comments

This repo contains Warp and TypeScript implementation of SmartWeave contract standards.
Contracts are written in Rust(Wasm runtime) or TypeScript(or both).

## Directories structure

- Contracts
  - [Atomic Asset Rust](https://github.com/warp-contracts/wrc/tree/master/contracts/atomic-asset-rust)
  - [Atomic Asset TypeScript](https://github.com/warp-contracts/wrc/tree/master/contracts/atomic-asset-typescript)
  - [ERC20](https://github.com/warp-contracts/wrc/tree/master/contracts/erc20)
  - [PST](https://github.com/warp-contracts/wrc/tree/master/contracts/pst)
- Examples
  - [Staking](https://github.com/warp-contracts/wrc/tree/master/examples/staking)

## Install dependencies

Run: `yarn`

## Build contract standard

Select contract you want to build and run:

`yarn build:[CONTRACT_NAME]`

eg.:

`yarn build:erc20`

## Build example contract

Select example contract you want to build and run

`yarn build:example:[EXAMPLE_CONTRACT_NAME]`

eg.:

`yarn build:example:staking`

## Run tests

#### Basic unit tests

Select contract you want to test and run:

`yarn test:[CONTRACT_NAME]`

eg.:

`yarn test:erc20`

## Deploy and test contracts on different networks

To run deploy and tests scripts select contract and script and run:

`yarn run workspace:[CONTRACT_WORKSPACE_NAME] scripts/[SCRIPT-NAME]`

eg.:

`yarn run workspace:warp-erc scripts/deploy.js`

All of the testing scripts should be invoked with a `--network` parameter
specifying one of the 3 possible networks:

- mainnet
- testnet
- local
