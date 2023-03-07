import path from 'path';
import { build } from 'esbuild';
import { ArWallet, ContractDeploy, Warp } from 'warp-contracts';
import { AtomicAssetContract, AtomicAssetContractImpl, AtomicAssetState } from 'atomic-asset-js-bindings';

export async function deployAtomicAsset(
    Warp: Warp,
    initialState: AtomicAssetState,
    ownerWallet: ArWallet,
    data: { 'Content-Type': string, body: string }
): Promise<[AtomicAssetState, ContractDeploy]> {
    // deploying contract using the new SDK.

    const bundledContractSrc = await build({
        entryPoints: [path.join(__dirname, '../atomic-asset-typescript/dist/contract/atomic-asset.js')],
        bundle: true,
        write: false,
        outfile: 'bundled.js'
    });

    return Warp.deploy
        ({
            wallet: ownerWallet,
            initState: JSON.stringify(initialState),
            src: bundledContractSrc.outputFiles[0].text,
            data
        })
        .then((txId) => [initialState, txId]);
}

export async function connectAtomicAsset(Warp: Warp, contractTxId: string, wallet: ArWallet): Promise<AtomicAssetContract> {
    let contract = new AtomicAssetContractImpl(contractTxId, Warp).setEvaluationOptions({
        internalWrites: true,
    }) as AtomicAssetContract;
    return contract.connect(wallet) as AtomicAssetContract;
}

