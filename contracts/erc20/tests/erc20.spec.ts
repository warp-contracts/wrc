import ArLocal from 'arlocal';
import { JWKInterface } from 'arweave/node/lib/wallet';
import { assert } from 'console';
import { getTag } from 'warp-contract-utils';
import { LoggerFactory, Warp, WarpFactory, SmartWeaveTags, ContractError } from 'warp-contracts';
import { DeployPlugin } from 'warp-contracts-plugin-deploy';
import { connectERC20, deployERC20, ERC20Contract, ERC20State } from '../bindings/erc20-js-binding';

jest.setTimeout(30000);

describe('Testing the ERC20 Token', () => {
  let contractSrc: Buffer;

  let ownerWallet: JWKInterface;
  let owner: string;
  let user2Wallet: JWKInterface;
  let user2: string;
  let user3Wallet: JWKInterface;
  let user3: string;

  let initialState: ERC20State;

  let arlocal: ArLocal;
  let warp: Warp;
  let erc20: ERC20Contract;

  let contractTxId: string;

  beforeAll(async () => {
    // note: each tests suit (i.e. file with tests that Jest is running concurrently
    // with another files has to have ArLocal set to a different port!)
    console.log('arlocal instance');
    arlocal = new ArLocal(1820);
    console.log('starting arlocal');
    await arlocal.start();

    LoggerFactory.INST.logLevel('error');
    LoggerFactory.INST.logLevel('debug', 'WASM:Rust');

    warp = WarpFactory.forLocal(1820).use(new DeployPlugin());

    ({ jwk: ownerWallet, address: owner } = await warp.generateWallet());
    ({ jwk: user2Wallet, address: user2 } = await warp.generateWallet());
    ({ jwk: user3Wallet, address: user3 } = await warp.generateWallet());

    initialState = {
      settings: null,
      symbol: 'ERC20-test',
      name: 'Sample ERC20 token',
      decimals: 18,
      totalSupply: 100,
      balances: {
        [owner]: 100,
      },
      allowances: {},
      owner: owner,
      canEvolve: true,
      evolve: '',
    };

    let deployedContract = await deployERC20(warp, initialState, ownerWallet);
    contractTxId = deployedContract[1].contractTxId;
    console.log('Deployed contract: ', deployedContract);
    erc20 = await connectERC20(warp, contractTxId, ownerWallet);
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

  it('should read erc20 state and balance data', async () => {
    expect(await erc20.currentState()).toEqual(initialState);
    expect((await erc20.balanceOf(owner)).balance).toEqual(100);
    expect((await erc20.totalSupply()).value).toEqual(100);
  });

  it('should not transfer more than user balance', async () => {
    await expect(
      erc20.transfer({
        to: 'user2',
        amount: 101,
      })
    ).rejects.toThrow(/CallerBalanceNotEnough.*100/);
  });

  it('should properly transfer tokens', async () => {
    await erc20.transfer({
      to: user2,
      amount: 10,
    });

    expect((await erc20.currentState()).balances[owner]).toEqual(90);
    expect((await erc20.currentState()).balances[user2]).toEqual(10);
  });

  it('should approve tokens', async () => {
    expect((await erc20.allowance(owner, user2)).allowance).toEqual(0);

    await erc20.approve({
      spender: user2,
      amount: 20,
    });

    expect((await erc20.allowance(owner, user2)).allowance).toEqual(20);
  });

  it('should not transfer from more tokens than allowed', async () => {
    let erc20FromUser2 = await connectERC20(warp, contractTxId, user2Wallet);

    await expect(
      erc20FromUser2.transferFrom({
        from: owner,
        to: user3,
        amount: 21,
      })
    ).rejects.toThrow(/CallerAllowanceNotEnough.*20/);
  });

  it('should transfer tokens using allowance', async () => {
    expect((await erc20.balanceOf(owner)).balance).toEqual(90);
    expect((await erc20.balanceOf(user2)).balance).toEqual(10);
    expect((await erc20.balanceOf(user3)).balance).toEqual(0);
    expect((await erc20.allowance(owner, user2)).allowance).toEqual(20);

    let erc20FromUser2 = await connectERC20(warp, contractTxId, user2Wallet);

    await erc20FromUser2.transferFrom({
      from: owner,
      to: user3,
      amount: 20,
    });

    let state = await erc20.currentState();
    console.log(state);

    expect((await erc20.balanceOf(owner)).balance).toEqual(70);
    expect((await erc20.balanceOf(user2)).balance).toEqual(10);
    expect((await erc20.balanceOf(user3)).balance).toEqual(20);
    expect((await erc20.allowance(owner, user2)).allowance).toEqual(0);
  });

  it('should clean balances state after transfer', async () => {
    expect((await erc20.balanceOf(owner)).balance).toEqual(70);
    expect((await erc20.balanceOf(user2)).balance).toEqual(10);
    expect((await erc20.balanceOf(user3)).balance).toEqual(20);
    expect(Object.keys((await erc20.currentState()).balances)).toHaveLength(3);

    let erc20FromUser2 = await connectERC20(warp, contractTxId, user2Wallet);
    await erc20FromUser2.transfer({ to: user3, amount: 10 });

    expect((await erc20.balanceOf(owner)).balance).toEqual(70);
    expect((await erc20.balanceOf(user2)).balance).toEqual(0);
    expect((await erc20.balanceOf(user3)).balance).toEqual(30);
    expect(Object.keys((await erc20.currentState()).balances)).toHaveLength(2);
  });

  it('should clean balances state after transferFrom', async () => {
    expect((await erc20.balanceOf(owner)).balance).toEqual(70);
    expect((await erc20.balanceOf(user3)).balance).toEqual(30);
    expect(Object.keys((await erc20.currentState()).balances)).toHaveLength(2);

    await erc20.approve({ spender: user2, amount: 70 });

    let erc20FromUser2 = await connectERC20(warp, contractTxId, user2Wallet);
    await erc20FromUser2.transferFrom({ from: owner, to: user3, amount: 70 });

    expect((await erc20.balanceOf(owner)).balance).toEqual(0);
    expect((await erc20.balanceOf(user2)).balance).toEqual(0);
    expect((await erc20.balanceOf(user3)).balance).toEqual(100);
    expect(Object.keys((await erc20.currentState()).balances)).toHaveLength(1);
  });

  it('should setup user allowances', async () => {
    await erc20.approve({ spender: user2, amount: 20 });
    await erc20.approve({ spender: user3, amount: 30 });

    expect((await erc20.allowance(owner, user2)).allowance).toEqual(20);
    expect((await erc20.allowance(owner, user3)).allowance).toEqual(30);

    expect(Object.keys((await erc20.currentState()).allowances)).toHaveLength(1);
    expect(Object.keys((await erc20.currentState()).allowances[owner])).toHaveLength(2);
  });

  it('should clean spender allowance after approve', async () => {
    await erc20.approve({ spender: user3, amount: 0 });

    expect((await erc20.allowance(owner, user2)).allowance).toEqual(20);
    expect((await erc20.allowance(owner, user3)).allowance).toEqual(0);

    expect(Object.keys((await erc20.currentState()).allowances)).toHaveLength(1);
    expect(Object.keys((await erc20.currentState()).allowances[owner])).toHaveLength(1);
  });

  it('should clean owner allowance after approve if there are no spenders', async () => {
    await erc20.approve({ spender: user2, amount: 0 });

    expect((await erc20.allowance(owner, user2)).allowance).toEqual(0);
    expect((await erc20.allowance(owner, user3)).allowance).toEqual(0);

    expect(Object.keys((await erc20.currentState()).allowances)).toHaveLength(0);
  });

  it('should reset user balances & allowances', async () => {
    let erc20FromUser3 = await connectERC20(warp, contractTxId, user3Wallet);
    await erc20FromUser3.transfer({ to: owner, amount: 70 });

    await erc20.approve({ spender: user2, amount: 20 });
    await erc20.approve({ spender: user3, amount: 30 });

    expect((await erc20.allowance(owner, user2)).allowance).toEqual(20);
    expect((await erc20.allowance(owner, user3)).allowance).toEqual(30);

    expect(Object.keys((await erc20.currentState()).allowances)).toHaveLength(1);
    expect(Object.keys((await erc20.currentState()).allowances[owner])).toHaveLength(2);
  });

  it('should clean spender allowance after transfer', async () => {
    let erc20FromUser3 = await connectERC20(warp, contractTxId, user3Wallet);
    await erc20FromUser3.transferFrom({ from: owner, to: user3, amount: 30 });

    expect((await erc20.allowance(owner, user2)).allowance).toEqual(20);
    expect((await erc20.allowance(owner, user3)).allowance).toEqual(0);

    expect(Object.keys((await erc20.currentState()).allowances)).toHaveLength(1);
    expect(Object.keys((await erc20.currentState()).allowances[owner])).toHaveLength(1);
  });

  it('should clean owner allowance after transfer if there are no spenders', async () => {
    let erc20FromUser2 = await connectERC20(warp, contractTxId, user2Wallet);
    await erc20FromUser2.transferFrom({ from: owner, to: user3, amount: 20 });

    expect((await erc20.allowance(owner, user2)).allowance).toEqual(0);
    expect((await erc20.allowance(owner, user3)).allowance).toEqual(0);

    expect(Object.keys((await erc20.currentState()).allowances)).toHaveLength(0);
  });
});
