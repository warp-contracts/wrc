import { AtomicAssetState, AtomicAssetContract, AtomicAssetContractImpl } from "atomic-asset-js-bindings";
import * as path from "path";
import * as fs from "fs";
import { ArWallet, ContractDeploy, Warp } from "warp-contracts";

export async function deployAtomicAsset(
    Warp: Warp,
    initialState: AtomicAssetState,
    ownerWallet: ArWallet,
    data: { 'Content-Type': string, body: string }
): Promise<[AtomicAssetState, ContractDeploy]> {
    // deploying contract using the new SDK.
    return Warp.deploy({
        wallet: ownerWallet,
        initState: JSON.stringify(initialState),
        src: fs.readFileSync(path.join(__dirname, '../pkg/atomic-asset-contract_bg.wasm')),
        wasmSrcCodeDir: path.join(__dirname, '../src'),
        wasmGlueCode: path.join(__dirname, '../pkg/atomic-asset-contract.js'),
        data
    })
        .then((txId) => [initialState, txId]);
}

export async function connectAtomicAsset(Warp: Warp, contractTxId: string, wallet: ArWallet): Promise<AtomicAssetContract> {
    const contract = new AtomicAssetContractImpl(contractTxId, Warp).setEvaluationOptions({
        internalWrites: true,
    });

    return contract.connect(wallet) as AtomicAssetContract;
}
