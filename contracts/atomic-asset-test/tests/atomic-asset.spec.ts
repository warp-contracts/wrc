import ArLocal from 'arlocal';
import { JWKInterface } from 'arweave/node/lib/wallet';
import { getTag } from 'warp-contract-utils';
import { LoggerFactory, Warp, WarpFactory, SMART_WEAVE_TAGS, WARP_TAGS } from 'warp-contracts';
import { AtomicAssetState, AtomicAssetContract } from "atomic-asset-js-bindings";
import { connectAtomicAsset, deployAtomicAsset as rustDeploy } from '../rust-impl';
import { deployAtomicAsset as tsDeploy } from '../ts-impl';
import { DeployPlugin } from 'warp-contracts-plugin-deploy';

jest.setTimeout(30000);

const deployAtomicAsset = async (impl, warp, initialState, ownerWallet, data) => {
  if (impl === "Rust") {
    return await rustDeploy(warp, initialState, ownerWallet, data);
  } else {
    return await tsDeploy(warp, initialState, ownerWallet, data);
  }
};

describe('Atomic Assets', () => {

  let arlocal: ArLocal;

  beforeAll(async () => {
    arlocal = new ArLocal(1820, false);
    await arlocal.start();
  });

  afterAll(async () => {
    await arlocal.stop();
  });

  describe.each([
    ["Rust"],
    ["Typescript"]
  ])('Testing the Atomic Asset %s implementation', (implementation) => {
    let ownerWallet: JWKInterface;
    let owner: string;
    let user2Wallet: JWKInterface;
    let user2: string;
    let user3Wallet: JWKInterface;
    let user3: string;

    let initialState: AtomicAssetState;

    let warp: Warp;
    let atomicAsset: AtomicAssetContract;

    let contractTxId: string;

    beforeAll(async () => {
      LoggerFactory.INST.logLevel('error');

      warp = WarpFactory.forLocal(1820).use(new DeployPlugin());

      ({ jwk: ownerWallet, address: owner } = await warp.generateWallet());
      ({ jwk: user2Wallet, address: user2 } = await warp.generateWallet());
      ({ jwk: user3Wallet, address: user3 } = await warp.generateWallet());

      initialState = {
        description: 'This is the test of Atomic Asset token',
        symbol: 'atomic-asset-test',
        name: 'Sample Atomic Asset token',
        decimals: 2,
        totalSupply: 100,
        balances: {
          [owner]: 100,
        },
        allowances: {},
        owner: owner,
      };


      let deployedContract = await deployAtomicAsset(implementation, warp, initialState, ownerWallet, { "Content-Type": "text/html", "body": "<h1>Hello</h1>" });
      contractTxId = deployedContract[1].contractTxId;
      console.log('Deployed contract: ', deployedContract);
      atomicAsset = await connectAtomicAsset(warp, contractTxId, ownerWallet);
    });

    it('should properly deploy contract', async () => {
      const contractTx = await warp.arweave.transactions.get(contractTxId);

      expect(contractTx).not.toBeNull();

      const contractSrcTx = await warp.arweave.transactions.get(getTag(contractTx, SMART_WEAVE_TAGS. CONTRACT_SRC_TX_ID));
      if (implementation === "Rust") {
        expect(getTag(contractSrcTx, SMART_WEAVE_TAGS. CONTENT_TYPE)).toEqual('application/wasm');
        expect(getTag(contractSrcTx, WARP_TAGS. WASM_LANG)).toEqual('rust');
      } else if (implementation === "Typescript") {
        expect(getTag(contractSrcTx, SMART_WEAVE_TAGS. CONTENT_TYPE)).toEqual('application/javascript');
        expect(getTag(contractSrcTx, WARP_TAGS. WASM_LANG)).toEqual(false);
      }
    });

    it('should read atomicAsset state and balance data', async () => {
      expect(await atomicAsset.currentState()).toEqual(initialState);
      expect((await atomicAsset.balanceOf(owner)).balance).toEqual(100);
      expect((await atomicAsset.totalSupply()).value).toEqual(100);
    });

    it('should not transfer more than user balance', async () => {
      await expect(
        atomicAsset.transfer({
          to: 'user2',
          amount: 101,
        },
          { strict: true }
        )
      ).rejects.toThrow(/Cannot create interaction.*CallerBalanceNotEnough.*100/);
    });

    it('should keep the owner if total supply belongs to one address', async () => {
      await atomicAsset.transfer({
        to: user2,
        amount: 1,
      });

      await (atomicAsset.connect(user2Wallet) as AtomicAssetContract).transfer({
        to: owner,
        amount: 1,
      });
      atomicAsset.connect(ownerWallet);

      expect((await atomicAsset.balanceOf(owner)).balance).toEqual(100);
      expect((await atomicAsset.balanceOf(user2)).balance).toEqual(0);

      expect(await atomicAsset.owner()).toEqual({ value: owner });
    });


    it('should properly transfer tokens', async () => {
      await atomicAsset.transfer({
        to: user2,
        amount: 10,
      });

      expect((await atomicAsset.balanceOf(owner)).balance).toEqual(90);
      expect((await atomicAsset.balanceOf(user2)).balance).toEqual(10);
    });

    it('should set owner to null when balances are fractional', async () => {
      expect((await atomicAsset.balanceOf(owner)).balance).toEqual(90);
      expect((await atomicAsset.balanceOf(user2)).balance).toEqual(10);

      expect(await atomicAsset.owner()).toEqual({ value: null });
    });

    it('should approve tokens', async () => {
      expect((await atomicAsset.allowance(owner, user2)).allowance).toEqual(0);

      await atomicAsset.approve({
        spender: user2,
        amount: 20,
      });

      expect((await atomicAsset.allowance(owner, user2)).allowance).toEqual(20);
    });

    it('should not transfer from more tokens than allowed', async () => {
      let atomicAssetFromUser2 = await connectAtomicAsset(warp, contractTxId, user2Wallet);

      await expect(
        atomicAssetFromUser2.transferFrom({
          from: owner,
          to: user3,
          amount: 21,
        },
          { strict: true }
        )
      ).rejects.toThrow(/Cannot create interaction:.*CallerAllowanceNotEnough.*20/);
    });

    it('should transfer tokens using allowance', async () => {
      expect((await atomicAsset.balanceOf(owner)).balance).toEqual(90);
      expect((await atomicAsset.balanceOf(user2)).balance).toEqual(10);
      expect((await atomicAsset.balanceOf(user3)).balance).toEqual(0);
      expect((await atomicAsset.allowance(owner, user2)).allowance).toEqual(20);

      let atomicAssetFromUser2 = await connectAtomicAsset(warp, contractTxId, user2Wallet);

      await atomicAssetFromUser2.transferFrom({
        from: owner,
        to: user3,
        amount: 20,
      });

      expect((await atomicAsset.balanceOf(owner)).balance).toEqual(70);
      expect((await atomicAsset.balanceOf(user2)).balance).toEqual(10);
      expect((await atomicAsset.balanceOf(user3)).balance).toEqual(20);
      expect((await atomicAsset.allowance(owner, user2)).allowance).toEqual(0);
    });

    it('should clean balances state after transfer', async () => {
      expect((await atomicAsset.balanceOf(owner)).balance).toEqual(70);
      expect((await atomicAsset.balanceOf(user2)).balance).toEqual(10);
      expect((await atomicAsset.balanceOf(user3)).balance).toEqual(20);
      expect(Object.keys((await atomicAsset.currentState()).balances)).toHaveLength(3);

      let atomicAssetFromUser2 = await connectAtomicAsset(warp, contractTxId, user2Wallet);
      await atomicAssetFromUser2.transfer({ to: user3, amount: 10 });

      expect((await atomicAsset.balanceOf(owner)).balance).toEqual(70);
      expect((await atomicAsset.balanceOf(user2)).balance).toEqual(0);
      expect((await atomicAsset.balanceOf(user3)).balance).toEqual(30);
      expect(Object.keys((await atomicAsset.currentState()).balances)).toHaveLength(2);
    });

    it('should clean balances state after transferFrom', async () => {
      expect((await atomicAsset.balanceOf(owner)).balance).toEqual(70);
      expect((await atomicAsset.balanceOf(user3)).balance).toEqual(30);
      expect(Object.keys((await atomicAsset.currentState()).balances)).toHaveLength(2);

      await atomicAsset.approve({ spender: user2, amount: 70 });

      let atomicAssetFromUser2 = await connectAtomicAsset(warp, contractTxId, user2Wallet);
      await atomicAssetFromUser2.transferFrom({ from: owner, to: user3, amount: 70 });

      expect((await atomicAsset.balanceOf(owner)).balance).toEqual(0);
      expect((await atomicAsset.balanceOf(user2)).balance).toEqual(0);
      expect((await atomicAsset.balanceOf(user3)).balance).toEqual(100);
      expect(Object.keys((await atomicAsset.currentState()).balances)).toHaveLength(1);
    });

    it('should setup user allowances', async () => {
      await atomicAsset.approve({ spender: user2, amount: 20 });
      await atomicAsset.approve({ spender: user3, amount: 30 });

      expect((await atomicAsset.allowance(owner, user2)).allowance).toEqual(20);
      expect((await atomicAsset.allowance(owner, user3)).allowance).toEqual(30);

      expect(Object.keys((await atomicAsset.currentState()).allowances)).toHaveLength(1);
      expect(Object.keys((await atomicAsset.currentState()).allowances[owner])).toHaveLength(2);
    });

    it('should clean spender allowance after approve', async () => {
      await atomicAsset.approve({ spender: user3, amount: 0 });

      expect((await atomicAsset.allowance(owner, user2)).allowance).toEqual(20);
      expect((await atomicAsset.allowance(owner, user3)).allowance).toEqual(0);

      expect(Object.keys((await atomicAsset.currentState()).allowances)).toHaveLength(1);
      expect(Object.keys((await atomicAsset.currentState()).allowances[owner])).toHaveLength(1);
    });

    it('should clean owner allowance after approve if there are no spenders', async () => {
      await atomicAsset.approve({ spender: user2, amount: 0 });

      expect((await atomicAsset.allowance(owner, user2)).allowance).toEqual(0);
      expect((await atomicAsset.allowance(owner, user3)).allowance).toEqual(0);

      expect(Object.keys((await atomicAsset.currentState()).allowances)).toHaveLength(0);
    });

    it('should reset user balances & allowances', async () => {
      let atomicAssetFromUser3 = await connectAtomicAsset(warp, contractTxId, user3Wallet);
      await atomicAssetFromUser3.transfer({ to: owner, amount: 70 });

      await atomicAsset.approve({ spender: user2, amount: 20 });
      await atomicAsset.approve({ spender: user3, amount: 30 });

      expect((await atomicAsset.allowance(owner, user2)).allowance).toEqual(20);
      expect((await atomicAsset.allowance(owner, user3)).allowance).toEqual(30);

      expect(Object.keys((await atomicAsset.currentState()).allowances)).toHaveLength(1);
      expect(Object.keys((await atomicAsset.currentState()).allowances[owner])).toHaveLength(2);
    });

    it('should clean spender allowance after transfer', async () => {
      let atomicAssetFromUser3 = await connectAtomicAsset(warp, contractTxId, user3Wallet);
      await atomicAssetFromUser3.transferFrom({ from: owner, to: user3, amount: 30 });

      expect((await atomicAsset.allowance(owner, user2)).allowance).toEqual(20);
      expect((await atomicAsset.allowance(owner, user3)).allowance).toEqual(0);

      expect(Object.keys((await atomicAsset.currentState()).allowances)).toHaveLength(1);
      expect(Object.keys((await atomicAsset.currentState()).allowances[owner])).toHaveLength(1);
    });

    it('should clean owner allowance after transfer if there are no spenders', async () => {
      let atomicAssetFromUser2 = await connectAtomicAsset(warp, contractTxId, user2Wallet);
      await atomicAssetFromUser2.transferFrom({ from: owner, to: user3, amount: 20 });

      expect((await atomicAsset.allowance(owner, user2)).allowance).toEqual(0);
      expect((await atomicAsset.allowance(owner, user3)).allowance).toEqual(0);

      expect(Object.keys((await atomicAsset.currentState()).allowances)).toHaveLength(0);
    });

    it('should set independent owner when they have total supply of tokens', async () => {
      await atomicAsset.transfer({ to: user3, amount: 20 });
      expect((await atomicAsset.currentState()).owner).toEqual(user3);
    });


    it('should transfer if transfer amount == 0', async () => {
      await atomicAsset.transfer({ to: user2, amount: 0 });
    });

    it('should increase allowance using increaseAllowance method', async () => {
      await atomicAsset.increaseAllowance({ spender: user2, amountToAdd: 20 });
      await atomicAsset.increaseAllowance({ spender: user3, amountToAdd: 30 });

      expect((await atomicAsset.allowance(owner, user2)).allowance).toEqual(20);
      expect((await atomicAsset.allowance(owner, user3)).allowance).toEqual(30);
    });

    it('should decrease allowance using decreaseAllowance method', async () => {
      await atomicAsset.decreaseAllowance({ spender: user2, amountToSubtract: 20 });
      await atomicAsset.decreaseAllowance({ spender: user3, amountToSubtract: 30 });

      expect((await atomicAsset.allowance(owner, user2)).allowance).toEqual(0);
      expect((await atomicAsset.allowance(owner, user3)).allowance).toEqual(0);
    });

    it('should throw when decreaseAllowance below zero', async () => {
      await expect(atomicAsset.decreaseAllowance({ spender: user3, amountToSubtract: 30 }, { strict: true })).rejects.toThrow(/Cannot create interaction.*AllowanceHasToGtThenZero/);
    });

  });

});
