import { AtomicAssetState, AtomicAssetContract, AtomicAssetContractImpl } from "atomic-asset-js-bindings";
import * as path from "path";
import * as fs from "fs";
import { ArWallet, ContractDeploy, Warp } from "warp-contracts";

const RUST_CONTRACT_BASE_PATH = path.join(__dirname, '../atomic-asset-rust');
const SRC_PATH = fs.readFileSync(path.join(RUST_CONTRACT_BASE_PATH, '/pkg/atomic-asset-contract_bg.wasm'));
const WASM_SRC_CODE_DIR = path.join(RUST_CONTRACT_BASE_PATH, 'src');
const WASM_GLUE_CODE = path.join(RUST_CONTRACT_BASE_PATH, '/pkg/atomic-asset-contract.js');

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
        src: SRC_PATH,
        wasmSrcCodeDir: WASM_SRC_CODE_DIR,
        wasmGlueCode: WASM_GLUE_CODE,
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
