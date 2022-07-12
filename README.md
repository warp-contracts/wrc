# RedStone SmartWeave ERC20

This repo contains SmartWeave implementation of the ERC20 token contract standard.

The repository also contains a sample Staking contract implemented to demonstrate the usual 
approval -> transferFrom flow of tokens. 

## Building contracts

#### Go into the `erc20` directory and run

`
yarn build
`

#### If you want to run integration tests - go into the `staking` directory and run

`
yarn build
`

## Running tests

#### Basic ERC20 unit tests

Go to the `erc20` directory and run

`
yarn test
`

#### Integration tests with a staking contract

Go to the `integration` directory and run

`
yarn test
`


## Deploying and testing contracts on different networks

All of the testing scripts should be invoked with a `--network` parameter specifying one of the 3 possible networks:
* mainnet
* testnet
* local


#### Integration tests

1. Deploy the erc20 contract: 

`
node ./scripts/deployERC20 --network mainnet
`

2. Deploy the staking contract:

`
node ./scripts/deployStaking --network mainnet
`

3. Run sample script with approvals, staking and withdrawals:

`
node ./scripts/approveAndStake --network mainnet
`


