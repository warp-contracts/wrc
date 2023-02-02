import ArLocal from 'arlocal';
import { getTag } from 'warp-contract-utils';
import { JWKInterface } from 'arweave/node/lib/wallet';
import { LoggerFactory, Warp, WarpFactory, SmartWeaveTags } from 'warp-contracts';
import { connectAtomicAsset, deployAtomicAsset } from '../helpers/helpers'
import { AtomicAssetState, AtomicAssetContract } from 'atomic-asset-js-bindings';

jest.setTimeout(30000);

describe('Testing the Atomic Asset Token', () => {
    let ownerWallet: JWKInterface;
    let owner: string;
    let user2Wallet: JWKInterface;
    let user2: string;
    let user3Wallet: JWKInterface;
    let user3: string;

    let initialState: AtomicAssetState;

    let arlocal: ArLocal;
    let warp: Warp;
    let atomicAsset: AtomicAssetContract;

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

        ({ jwk: ownerWallet, address: owner } = await warp.generateWallet());
        ({ jwk: user2Wallet, address: user2 } = await warp.generateWallet());
        ({ jwk: user3Wallet, address: user3 } = await warp.generateWallet());

        initialState = {
            description: 'This is the test of Atomic Asset token',
            settings: null,
            symbol: 'atomic-asset-test',
            name: 'Sample Atomic Asset token',
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

        let deployedContract = await deployAtomicAsset(warp, initialState, ownerWallet);
        contractTxId = deployedContract[1].contractTxId;
        console.log('Deployed contract: ', deployedContract);
        atomicAsset = await connectAtomicAsset(warp, contractTxId, ownerWallet);
    });

    afterAll(async () => {
        await arlocal.stop();
    });

    it('should properly deploy contract', async () => {
        const contractTx = await warp.arweave.transactions.get(contractTxId);

        expect(contractTx).not.toBeNull();

        const contractSrcTx = await warp.arweave.transactions.get(getTag(contractTx, SmartWeaveTags.CONTRACT_SRC_TX_ID));
        expect(getTag(contractSrcTx, SmartWeaveTags.CONTENT_TYPE)).toEqual('application/javascript');
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
            })
        ).rejects.toThrow('Cannot create interaction: Caller balance not enough 100');
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

        expect((await atomicAsset.currentState()).owner).toEqual(owner);
    });

    it('should properly transfer tokens', async () => {

        console.log(await atomicAsset.currentState())
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

        expect((await atomicAsset.currentState()).owner).toEqual(null);
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
            })
        ).rejects.toThrow('Cannot create interaction: Caller allowance not enough 20');
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

    it('should fail to transfer if transfer amount == 0', async () => {
        await expect(atomicAsset.transfer({ to: user2, amount: 0 })).rejects.toThrowError("Validation error: \"amount\" has to be integer and > 0")
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
        await expect(atomicAsset.decreaseAllowance({ spender: user3, amountToSubtract: 30 })).rejects.toThrowError("Cannot create interaction: Can not decrease allowance below 0");
    });
});

