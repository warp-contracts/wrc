import ArLocal from 'arlocal';
import { JWKInterface } from 'arweave/node/lib/wallet';
import { LoggerFactory, Warp, WarpFactory, SmartWeaveTags } from 'warp-contracts';

import { connectERC20, deployERC20, ERC20Contract, ERC20State } from 'erc20/bindings/erc20-js-binding';

import { connectStaking, deployStaking, StakingContract, StakingState } from '../bindings/staking-js-binding';
import { getTag } from 'warp-contract-utils';
import { DeployPlugin } from 'warp-contracts-plugin-deploy';

jest.setTimeout(120000);

describe('Testing the Staking Logic', () => {
  let ownerWallet: JWKInterface;
  let owner: string;
  let user1Wallet: JWKInterface;
  let user1: string;
  let user2Wallet: JWKInterface;
  let user2: string;

  let initialERC20State: ERC20State;
  let initialStakingState: StakingState;

  let arlocal: ArLocal;
  let warp: Warp;
  let erc20: ERC20Contract;
  let staking: StakingContract;

  let stakingContractTxId: string;
  let erc20ContractTxId: string;

  beforeAll(async () => {
    // note: each tests suit (i.e. file with tests that Jest is running concurrently
    // with another files has to have ArLocal set to a different port!)
    arlocal = new ArLocal(1821, false);
    await arlocal.start();
    Error.stackTraceLimit = 25;

    LoggerFactory.INST.logLevel('debug');
    //LoggerFactory.INST.logLevel('debug', 'WASM:Rust');
    //LoggerFactory.INST.logLevel('debug', 'WasmContractHandlerApi');

    warp = WarpFactory.forLocal(1821).use(new DeployPlugin());

    ownerWallet = (await warp.generateWallet()).jwk;
    owner = await warp.arweave.wallets.jwkToAddress(ownerWallet);

    user1Wallet = (await warp.generateWallet()).jwk;
    user1 = await warp.arweave.wallets.jwkToAddress(user1Wallet);

    user2Wallet = (await warp.generateWallet()).jwk;
    user2 = await warp.arweave.wallets.jwkToAddress(user2Wallet);

    initialERC20State = {
      settings: null,
      symbol: 'ERC20-test',
      name: 'Sample ERC20 token',
      decimals: 18,
      totalSupply: 100,
      balances: {
        [user1]: 100,
      },
      allowances: {},
      owner: owner,
      canEvolve: true,
      evolve: '',
    };

    let deployedERC20Contract = await deployERC20(warp, initialERC20State, ownerWallet);
    erc20ContractTxId = deployedERC20Contract[1].contractTxId;
    console.log('Deployed ERC20 contract: ', deployedERC20Contract);
    erc20 = await connectERC20(warp, erc20ContractTxId, user1Wallet);

    initialStakingState = {
      canEvolve: true,
      evolve: '',
      settings: null,
      owner: owner,
      token: erc20ContractTxId,
      stakes: {},
    };

    let deployedStakingContract = await deployStaking(warp, initialStakingState, ownerWallet);
    stakingContractTxId = deployedStakingContract[1].contractTxId;
    console.log('Deployed staking contract: ', deployedStakingContract);
    staking = await connectStaking(warp, stakingContractTxId, user1Wallet);
  });

  afterAll(async () => {
    await arlocal.stop();
  });

  it('should properly deploy contract ERC20 contract', async () => {
    const contractTx = await warp.arweave.transactions.get(erc20ContractTxId);

    expect(contractTx).not.toBeNull();

    const contractSrcTx = await warp.arweave.transactions.get(getTag(contractTx, SmartWeaveTags.CONTRACT_SRC_TX_ID));
    expect(getTag(contractSrcTx, SmartWeaveTags.CONTENT_TYPE)).toEqual('application/wasm');
    expect(getTag(contractSrcTx, SmartWeaveTags.WASM_LANG)).toEqual('rust');

    expect(await erc20.currentState()).toEqual(initialERC20State);
  });

  it('should properly deploy staking contract', async () => {
    const contractTx = await warp.arweave.transactions.get(stakingContractTxId);

    expect(contractTx).not.toBeNull();

    const contractSrcTx = await warp.arweave.transactions.get(getTag(contractTx, SmartWeaveTags.CONTRACT_SRC_TX_ID));
    expect(getTag(contractSrcTx, SmartWeaveTags.CONTENT_TYPE)).toEqual('application/wasm');
    expect(getTag(contractSrcTx, SmartWeaveTags.WASM_LANG)).toEqual('rust');

    expect(await staking.currentState()).toEqual(initialStakingState);
  });

  it('should read erc20 balance', async () => {
    expect((await erc20.balanceOf(user1)).balance).toEqual(100);
  });

  it('should approve tokens', async () => {
    expect((await erc20.allowance(user1, stakingContractTxId)).allowance).toEqual(0);

    await erc20.approve({
      spender: stakingContractTxId,
      amount: 120,
    });

    expect((await erc20.allowance(user1, stakingContractTxId)).allowance).toEqual(120);
  });

  it('should not stake more than owned', async () => {
    expect((await erc20.balanceOf(user1)).balance).toEqual(100);
    expect((await erc20.balanceOf(stakingContractTxId)).balance).toEqual(0);
    expect((await erc20.allowance(user1, stakingContractTxId)).allowance).toEqual(120);

    await expect(staking.stake(110)).rejects.toThrow(
      /CallerBalanceNotEnough/
    );
  });

  it('should not stake more than allowed', async () => {
    await erc20.approve({
      spender: stakingContractTxId,
      amount: 50,
    });

    expect((await erc20.balanceOf(user1)).balance).toEqual(100);
    expect((await erc20.balanceOf(stakingContractTxId)).balance).toEqual(0);
    expect((await erc20.allowance(user1, stakingContractTxId)).allowance).toEqual(50);

    expect((await staking.stakeOf(user1)).stake).toEqual(0);

    await expect(staking.stake(60)).rejects.toThrow(
      /CallerAllowanceNotEnough/
    );
  });

  it('should stake tokens', async () => {
    expect((await erc20.balanceOf(user1)).balance).toEqual(100);
    expect((await erc20.balanceOf(stakingContractTxId)).balance).toEqual(0);
    expect((await erc20.allowance(user1, stakingContractTxId)).allowance).toEqual(50);

    expect((await staking.stakeOf(user1)).stake).toEqual(0);

    await staking.stake(10);

    expect((await erc20.balanceOf(user1)).balance).toEqual(90);
    expect((await erc20.balanceOf(stakingContractTxId)).balance).toEqual(10);
    expect((await erc20.allowance(user1, stakingContractTxId)).allowance).toEqual(40);

    expect((await staking.stakeOf(user1)).stake).toEqual(10);
  });

  it('should withdraw part of staked tokens', async () => {
    expect((await erc20.balanceOf(user1)).balance).toEqual(90);
    expect((await erc20.balanceOf(stakingContractTxId)).balance).toEqual(10);
    expect((await staking.stakeOf(user1)).stake).toEqual(10);

    await staking.withdraw(5);

    expect((await erc20.balanceOf(user1)).balance).toEqual(95);
    expect((await erc20.balanceOf(stakingContractTxId)).balance).toEqual(5);
    expect((await staking.stakeOf(user1)).stake).toEqual(5);
  });

  it('should withdraw all of staked tokens', async () => {
    expect((await erc20.balanceOf(user1)).balance).toEqual(95);
    expect((await erc20.balanceOf(stakingContractTxId)).balance).toEqual(5);
    expect((await staking.stakeOf(user1)).stake).toEqual(5);

    await staking.withdraw(5);

    expect((await erc20.balanceOf(user1)).balance).toEqual(100);
    expect((await erc20.balanceOf(stakingContractTxId)).balance).toEqual(0);
    expect((await staking.stakeOf(user1)).stake).toEqual(0);
  });

  it('should stake all the owned tokens', async () => {
    await erc20.approve({
      spender: stakingContractTxId,
      amount: 1000,
    });

    expect((await erc20.balanceOf(user1)).balance).toEqual(100);
    expect((await erc20.balanceOf(stakingContractTxId)).balance).toEqual(0);
    expect((await staking.stakeOf(user1)).stake).toEqual(0);

    await staking.stakeAll();

    expect((await erc20.balanceOf(user1)).balance).toEqual(0);
    expect((await erc20.balanceOf(stakingContractTxId)).balance).toEqual(100);
    expect((await staking.stakeOf(user1)).stake).toEqual(100);
  });

  it('should withdraw half of staked tokens', async () => {
    expect((await erc20.balanceOf(user1)).balance).toEqual(0);
    expect((await erc20.balanceOf(stakingContractTxId)).balance).toEqual(100);
    expect((await staking.stakeOf(user1)).stake).toEqual(100);

    await staking.withdraw(50);

    expect((await erc20.balanceOf(user1)).balance).toEqual(50);
    expect((await erc20.balanceOf(stakingContractTxId)).balance).toEqual(50);
    expect((await staking.stakeOf(user1)).stake).toEqual(50);
  });

  it('should re stake', async () => {
    expect((await erc20.balanceOf(user1)).balance).toEqual(50);
    expect((await erc20.balanceOf(stakingContractTxId)).balance).toEqual(50);
    expect((await staking.stakeOf(user1)).stake).toEqual(50);

    await staking.reStake();

    expect((await erc20.balanceOf(user1)).balance).toEqual(0);
    expect((await erc20.balanceOf(stakingContractTxId)).balance).toEqual(100);
    expect((await staking.stakeOf(user1)).stake).toEqual(100);
  });
});
