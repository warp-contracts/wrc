import ArLocal from 'arlocal';
import Arweave from 'arweave';
import { JWKInterface } from 'arweave/node/lib/wallet';
import {
  getTag,
  InteractionResult,
  LoggerFactory,
  SmartWeave,
  SmartWeaveNodeFactory,
  SmartWeaveTags,
} from 'redstone-smartweave';
import {
  connectERC20,
  deployERC20,
  ERC20Contract,
  ERC20State
} from '../../erc20/tests/erc20-js-binding';

import {
  connectStaking,
  deployStaking,
  StakingContract,
  StakingState
} from '../../staking/tests/staking-js-binding';
import { addFunds, mineBlock } from './utils';

jest.setTimeout(30000);

describe('Testing the Staking Logic', () => {
  let ownerWallet: JWKInterface;
  let owner: string;
  let user1Wallet: JWKInterface;
  let user1: string;
  let user2Wallet: JWKInterface;
  let user2: string;

  let initialERC20State: ERC20State;
  let initialStakingState: StakingState;

  let arweave: Arweave;
  let arlocal: ArLocal;
  let smartweave: SmartWeave;
  let erc20: ERC20Contract;
  let staking: StakingContract;

  let stakingContractTxId: string;
  let erc20ContractTxId: string;

  beforeAll(async () => {
    // note: each tests suit (i.e. file with tests that Jest is running concurrently
    // with another files has to have ArLocal set to a different port!)
    arlocal = new ArLocal(1820, false);
    await arlocal.start();

    arweave = Arweave.init({
      host: 'localhost',
      port: 1820,
      protocol: 'http',
    });

    LoggerFactory.INST.logLevel('error');
    LoggerFactory.INST.logLevel('debug', 'WASM:Rust');
    //LoggerFactory.INST.logLevel('debug', 'WasmContractHandlerApi');

    smartweave = SmartWeaveNodeFactory.memCached(arweave);

    ownerWallet = await arweave.wallets.generate();
    await addFunds(arweave, ownerWallet);
    owner = await arweave.wallets.jwkToAddress(ownerWallet);

    user1Wallet = await arweave.wallets.generate();
    await addFunds(arweave, user1Wallet);
    user1 = await arweave.wallets.jwkToAddress(user1Wallet);

    user2Wallet = await arweave.wallets.generate();
    await addFunds(arweave, user2Wallet);
    user2 = await arweave.wallets.jwkToAddress(user2Wallet);


    initialERC20State = {
      canEvolve: true,
      evolve: "",
      settings: null,
      ticker: "ERC20-test",
      owner: owner,
      balances: {
        [user1]: 100,
      },
      allowances: {}
    };

    let deployedERC20Contract = await deployERC20(smartweave, initialERC20State, ownerWallet);
    erc20ContractTxId = deployedERC20Contract[1]
    console.log("Deployed ERC20 contract: ", deployedERC20Contract);
    erc20 = await connectERC20(smartweave, erc20ContractTxId, user1Wallet);

    initialStakingState = {
      canEvolve: true,
      evolve: "",
      settings: null,
      owner: owner,
      token: erc20ContractTxId,
      stakes: {}
    };

    let deployedStakingContract = await deployStaking(smartweave, initialStakingState, ownerWallet);
    stakingContractTxId = deployedStakingContract[1]
    console.log("Deployed staking contract: ", deployedStakingContract);
    staking = await connectStaking(smartweave, stakingContractTxId, user1Wallet);

    await mineBlock(arweave);
  });

  afterAll(async () => {
    await arlocal.stop();
  });

  it('should properly deploy contract ERC20 contract', async () => {
    const contractTx = await arweave.transactions.get(erc20ContractTxId);

    expect(contractTx).not.toBeNull();

    const contractSrcTx = await arweave.transactions.get(
      getTag(contractTx, SmartWeaveTags.CONTRACT_SRC_TX_ID)
    );
    expect(getTag(contractSrcTx, SmartWeaveTags.CONTENT_TYPE)).toEqual(
      'application/wasm'
    );
    expect(getTag(contractSrcTx, SmartWeaveTags.WASM_LANG)).toEqual('rust');

    expect(await erc20.currentState()).toEqual(initialERC20State);
  });

  it('should properly deploy staking contract', async () => {
    const contractTx = await arweave.transactions.get(stakingContractTxId);

    expect(contractTx).not.toBeNull();

    const contractSrcTx = await arweave.transactions.get(
        getTag(contractTx, SmartWeaveTags.CONTRACT_SRC_TX_ID)
    );
    expect(getTag(contractSrcTx, SmartWeaveTags.CONTENT_TYPE)).toEqual(
        'application/wasm'
    );
    expect(getTag(contractSrcTx, SmartWeaveTags.WASM_LANG)).toEqual('rust');

    expect(await staking.currentState()).toEqual(initialStakingState);
  });

  // it('should read erc20 state and balance data', async () => {
  //   expect(await erc20.currentState()).toEqual(initialState);
  //   expect((await erc20.balanceOf(owner)).balance).toEqual(100);
  // });
  //
  // it('should not transfer more than user balance', async () => {
  //   await expect(erc20.transfer({
  //     target: 'user2',
  //     qty: 101,
  //   })).rejects.toThrow('Cannot create interaction: [CE:CallerBalanceNotEnough 100]');
  // });
  //

  it('should approve tokens', async () => {
    expect((await erc20.allowance(user1, stakingContractTxId)).allowance).toEqual(0);

    await erc20.approve({
      spender: stakingContractTxId,
      amount: 120,
    });

    await mineBlock(arweave);

    expect((await erc20.allowance(user1, stakingContractTxId)).allowance).toEqual(120);
  });

  it('should not stake more than owned', async () => {
    expect((await erc20.balanceOf(user1)).balance).toEqual(100);
    expect((await erc20.balanceOf(stakingContractTxId)).balance).toEqual(0);
    expect((await erc20.allowance(user1, stakingContractTxId)).allowance).toEqual(120);

    await expect(staking.stake(110))
        .rejects.toThrow('Cannot create interaction: [CE:FailedTokenTransfer [CE:CallerBalanceNotEnough 100]]');
  });

  it('should not stake more than allowed', async () => {
    await erc20.approve({
      spender: stakingContractTxId,
      amount: 50,
    });

    await mineBlock(arweave);

    expect((await erc20.balanceOf(user1)).balance).toEqual(100);
    expect((await erc20.balanceOf(stakingContractTxId)).balance).toEqual(0);
    expect((await erc20.allowance(user1, stakingContractTxId)).allowance).toEqual(50);

    expect((await staking.stakeOf(user1)).stake).toEqual(0);

    await expect(staking.stake(60))
        .rejects.toThrow('Cannot create interaction: [CE:FailedTokenTransfer [CE:CallerAllowanceNotEnough 50]]');
  });


  it('should stake tokens', async () => {
    expect((await erc20.balanceOf(user1)).balance).toEqual(100);
    expect((await erc20.balanceOf(stakingContractTxId)).balance).toEqual(0);
    expect((await erc20.allowance(user1, stakingContractTxId)).allowance).toEqual(50);

    expect((await staking.stakeOf(user1)).stake).toEqual(0);

    await staking.stake(10);

    await mineBlock(arweave);

    expect((await erc20.balanceOf(user1)).balance).toEqual(90);
    expect((await erc20.balanceOf(stakingContractTxId)).balance).toEqual(10);
    expect((await erc20.allowance(user1, stakingContractTxId)).allowance).toEqual(40);

    expect((await staking.stakeOf(user1)).stake).toEqual(10);
  });

});
