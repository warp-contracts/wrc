# Warp Rust Contracts

This repo contains Warp implementation of contract standards.

## Directories structure

- Contracts
  - Atomic NFT
  - ERC20
  - PST
- Examples
  - Staking

## Install dependencies

Run:
`yarn`

## Build contract standard

Select contract you want to build and run:

`yarn build:[CONTRACT_NAME]`

eg.:

`yarn build:erc20 `

## Build example contract

Select example contract you want to build and run

`yarn build:example:[EXAMPLE_CONTRACT_NAME]`

eg.:

`yarn build:example:staking `

## Run tests

#### Basic unit tests

Select contract you want to test and run:

`yarn test:[CONTRACT_NAME]`

eg.:

`yarn test:erc20 `

## Deploy and test contracts on different networks

To run deploy and tests scripts select contract and script and run:

`
yarn run workspace:[CONTRACT_WORKSPACE_NAME] scripts/[SCRIPT-NAME]
`

eg.:

`
yarn run workspace:warp-erc
`

All of the testing scripts should be invoked with a `--network` parameter specifying one of the 3 possible networks:

- mainnet
- testnet
- local
