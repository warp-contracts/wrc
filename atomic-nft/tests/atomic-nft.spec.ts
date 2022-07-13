import fs from 'fs';

import ArLocal from 'arlocal';
import { JWKInterface } from 'arweave/node/lib/wallet';
import { getTag, LoggerFactory, Warp, WarpFactory, SmartWeaveTags } from 'warp-contracts';
import { AtomicNFTState, connectAtomicNFT, deployAtomicNFT, AtomicNFTContract } from '../utils/atomic-nft-js-binding';

jest.setTimeout(30000);

describe('Testing the Atomic NFT Token', () => {
  let ownerWallet: JWKInterface;
  let owner: string;
  let user2Wallet: JWKInterface;
  let user2: string;
  let user3Wallet: JWKInterface;
  let user3: string;

  let initialState: AtomicNFTState;

  let arlocal: ArLocal;
  let warp: Warp;
  let atomicNFT: AtomicNFTContract;

  let contractTxId: string;

  beforeAll(async () => {
    // note: each tests suit (i.e. file with tests that Jest is running concurrently
    // with another files has to have ArLocal set to a different port!)
    arlocal = new ArLocal(1820, false);
    await arlocal.start();

    LoggerFactory.INST.logLevel('error');
    LoggerFactory.INST.logLevel('debug', 'WASM:Rust');
    //LoggerFactory.INST.logLevel('debug', 'WasmContractHandlerApi');

    warp = WarpFactory.forLocal(1820);

    ownerWallet = await warp.testing.generateWallet();
    owner = await warp.arweave.wallets.jwkToAddress(ownerWallet);

    user2Wallet = await warp.testing.generateWallet();
    user2 = await warp.arweave.wallets.jwkToAddress(user2Wallet);

    user3Wallet = await warp.testing.generateWallet();
    user3 = await warp.arweave.wallets.jwkToAddress(user3Wallet);

    initialState = {
      title: 'Atomic NFT token test',
      description: 'This is the test of Atomic NFT token',
      contentType: 'text/html',
      settings: null,
      symbol: 'atomic-NFT-test',
      name: 'Sample Atomic NFT token',
      decimals: 2,
      totalSupply: 100,
      balances: {
        [owner]: 100,
      },
      allowances: {},
      owner: owner,
      canEvolve: true,
      evolve: '',
    };

    let deployedContract = await deployAtomicNFT(warp, initialState, ownerWallet);
    contractTxId = deployedContract[1].contractTxId;
    console.log('Deployed contract: ', deployedContract);
    atomicNFT = await connectAtomicNFT(warp, contractTxId, ownerWallet);
  });

  afterAll(async () => {
    await arlocal.stop();
  });

  it('should properly deploy contract', async () => {
    const contractTx = await warp.arweave.transactions.get(contractTxId);

    expect(contractTx).not.toBeNull();

    const contractSrcTx = await warp.arweave.transactions.get(getTag(contractTx, SmartWeaveTags.CONTRACT_SRC_TX_ID));
    expect(getTag(contractSrcTx, SmartWeaveTags.CONTENT_TYPE)).toEqual('application/wasm');
    expect(getTag(contractSrcTx, SmartWeaveTags.WASM_LANG)).toEqual('rust');
  });

  it('should read atomicNFT state and balance data', async () => {
    expect(await atomicNFT.currentState()).toEqual(initialState);
    expect((await atomicNFT.balanceOf(owner)).balance).toEqual(100);
    expect((await atomicNFT.totalSupply()).value).toEqual(100);
  });

  it('should not transfer more than user balance', async () => {
    await expect(
      atomicNFT.transfer({
        to: 'user2',
        amount: 101,
      })
    ).rejects.toThrow('Cannot create interaction: [CE:CallerBalanceNotEnough 100]');
  });

  it('should keep the owner if total supply belongs to one address', async () => {
    await atomicNFT.transfer({
      to: user2,
      amount: 0,
    });

    expect((await atomicNFT.balanceOf(owner)).balance).toEqual(100);
    expect((await atomicNFT.balanceOf(user2)).balance).toEqual(0);

    expect((await atomicNFT.currentState()).owner).toEqual(owner);
  });

  it('should properly transfer tokens', async () => {
    await atomicNFT.transfer({
      to: user2,
      amount: 10,
    });

    expect((await atomicNFT.balanceOf(owner)).balance).toEqual(90);
    expect((await atomicNFT.balanceOf(user2)).balance).toEqual(10);
  });

  it('should set owner to null when balances are fractional', async () => {
    expect((await atomicNFT.balanceOf(owner)).balance).toEqual(90);
    expect((await atomicNFT.balanceOf(user2)).balance).toEqual(10);

    expect((await atomicNFT.currentState()).owner).toEqual(null);
  });

  it('should approve tokens', async () => {
    expect((await atomicNFT.allowance(owner, user2)).allowance).toEqual(0);

    await atomicNFT.approve({
      spender: user2,
      amount: 20,
    });

    expect((await atomicNFT.allowance(owner, user2)).allowance).toEqual(20);
  });

  it('should not transfer from more tokens than allowed', async () => {
    let atomicNFTFromUser2 = await connectAtomicNFT(warp, contractTxId, user2Wallet);

    await expect(
      atomicNFTFromUser2.transferFrom({
        from: owner,
        to: user3,
        amount: 21,
      })
    ).rejects.toThrow('Cannot create interaction: [CE:CallerAllowanceNotEnough 20]');
  });

  it('should transfer tokens using allowance', async () => {
    expect((await atomicNFT.balanceOf(owner)).balance).toEqual(90);
    expect((await atomicNFT.balanceOf(user2)).balance).toEqual(10);
    expect((await atomicNFT.balanceOf(user3)).balance).toEqual(0);
    expect((await atomicNFT.allowance(owner, user2)).allowance).toEqual(20);

    let atomicNFTFromUser2 = await connectAtomicNFT(warp, contractTxId, user2Wallet);

    await atomicNFTFromUser2.transferFrom({
      from: owner,
      to: user3,
      amount: 20,
    });

    expect((await atomicNFT.balanceOf(owner)).balance).toEqual(70);
    expect((await atomicNFT.balanceOf(user2)).balance).toEqual(10);
    expect((await atomicNFT.balanceOf(user3)).balance).toEqual(20);
    expect((await atomicNFT.allowance(owner, user2)).allowance).toEqual(0);
  });

  it('should clean balances state after transfer', async () => {
    expect((await atomicNFT.balanceOf(owner)).balance).toEqual(70);
    expect((await atomicNFT.balanceOf(user2)).balance).toEqual(10);
    expect((await atomicNFT.balanceOf(user3)).balance).toEqual(20);
    expect(Object.keys((await atomicNFT.currentState()).balances)).toHaveLength(3);

    let atomicNFTFromUser2 = await connectAtomicNFT(warp, contractTxId, user2Wallet);
    await atomicNFTFromUser2.transfer({ to: user3, amount: 10 });

    expect((await atomicNFT.balanceOf(owner)).balance).toEqual(70);
    expect((await atomicNFT.balanceOf(user2)).balance).toEqual(0);
    expect((await atomicNFT.balanceOf(user3)).balance).toEqual(30);
    expect(Object.keys((await atomicNFT.currentState()).balances)).toHaveLength(2);
  });

  it('should clean balances state after transferFrom', async () => {
    expect((await atomicNFT.balanceOf(owner)).balance).toEqual(70);
    expect((await atomicNFT.balanceOf(user3)).balance).toEqual(30);
    expect(Object.keys((await atomicNFT.currentState()).balances)).toHaveLength(2);

    await atomicNFT.approve({ spender: user2, amount: 70 });

    let atomicNFTFromUser2 = await connectAtomicNFT(warp, contractTxId, user2Wallet);
    await atomicNFTFromUser2.transferFrom({ from: owner, to: user3, amount: 70 });

    expect((await atomicNFT.balanceOf(owner)).balance).toEqual(0);
    expect((await atomicNFT.balanceOf(user2)).balance).toEqual(0);
    expect((await atomicNFT.balanceOf(user3)).balance).toEqual(100);
    expect(Object.keys((await atomicNFT.currentState()).balances)).toHaveLength(1);
  });

  it('should setup user allowances', async () => {
    await atomicNFT.approve({ spender: user2, amount: 20 });
    await atomicNFT.approve({ spender: user3, amount: 30 });

    expect((await atomicNFT.allowance(owner, user2)).allowance).toEqual(20);
    expect((await atomicNFT.allowance(owner, user3)).allowance).toEqual(30);

    expect(Object.keys((await atomicNFT.currentState()).allowances)).toHaveLength(1);
    expect(Object.keys((await atomicNFT.currentState()).allowances[owner])).toHaveLength(2);
  });

  it('should clean spender allowance after approve', async () => {
    await atomicNFT.approve({ spender: user3, amount: 0 });

    expect((await atomicNFT.allowance(owner, user2)).allowance).toEqual(20);
    expect((await atomicNFT.allowance(owner, user3)).allowance).toEqual(0);

    expect(Object.keys((await atomicNFT.currentState()).allowances)).toHaveLength(1);
    expect(Object.keys((await atomicNFT.currentState()).allowances[owner])).toHaveLength(1);
  });

  it('should clean owner allowance after approve if there are no spenders', async () => {
    await atomicNFT.approve({ spender: user2, amount: 0 });

    expect((await atomicNFT.allowance(owner, user2)).allowance).toEqual(0);
    expect((await atomicNFT.allowance(owner, user3)).allowance).toEqual(0);

    expect(Object.keys((await atomicNFT.currentState()).allowances)).toHaveLength(0);
  });

  it('should reset user balances & allowances', async () => {
    let atomicNFTFromUser3 = await connectAtomicNFT(warp, contractTxId, user3Wallet);
    await atomicNFTFromUser3.transfer({ to: owner, amount: 70 });

    await atomicNFT.approve({ spender: user2, amount: 20 });
    await atomicNFT.approve({ spender: user3, amount: 30 });

    expect((await atomicNFT.allowance(owner, user2)).allowance).toEqual(20);
    expect((await atomicNFT.allowance(owner, user3)).allowance).toEqual(30);

    expect(Object.keys((await atomicNFT.currentState()).allowances)).toHaveLength(1);
    expect(Object.keys((await atomicNFT.currentState()).allowances[owner])).toHaveLength(2);
  });

  it('should clean spender allowance after transfer', async () => {
    let atomicNFTFromUser3 = await connectAtomicNFT(warp, contractTxId, user3Wallet);
    await atomicNFTFromUser3.transferFrom({ from: owner, to: user3, amount: 30 });

    expect((await atomicNFT.allowance(owner, user2)).allowance).toEqual(20);
    expect((await atomicNFT.allowance(owner, user3)).allowance).toEqual(0);

    expect(Object.keys((await atomicNFT.currentState()).allowances)).toHaveLength(1);
    expect(Object.keys((await atomicNFT.currentState()).allowances[owner])).toHaveLength(1);
  });

  it('should clean owner allowance after transfer if there are no spenders', async () => {
    let atomicNFTFromUser2 = await connectAtomicNFT(warp, contractTxId, user2Wallet);
    await atomicNFTFromUser2.transferFrom({ from: owner, to: user3, amount: 20 });

    expect((await atomicNFT.allowance(owner, user2)).allowance).toEqual(0);
    expect((await atomicNFT.allowance(owner, user3)).allowance).toEqual(0);

    expect(Object.keys((await atomicNFT.currentState()).allowances)).toHaveLength(0);
  });

  it('should set independent owner when they have total supply of tokens', async () => {
    await atomicNFT.transfer({ to: user3, amount: 20 });
    expect((await atomicNFT.currentState()).owner).toEqual(user3);
  });
});
