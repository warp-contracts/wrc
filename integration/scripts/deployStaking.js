const fs = require('fs');
const path = require('path');
const { getWarp, setContractTxId, loadWallet, getContractTxId } = require('./utils');

//LoggerFactory.INST.logLevel('debug', 'WasmContractHandlerApi');

(async () => {
    const warp = getWarp();
    const [ownerWallet, ownerAddress] = await loadWallet(warp);

    let erc20TxId = getContractTxId(warp.environment, "erc20");

    let initialStakingState = {
        canEvolve: true,
        evolve: "",
        settings: null,
        owner: ownerAddress,
        token: erc20TxId,
        stakes: {}
    };

    let deployment = await warp.createContract.deploy({
        wallet: ownerWallet,
        initState: JSON.stringify(initialStakingState),
        src: fs.readFileSync(path.join(__dirname, "../../staking/pkg/staking-contract_bg.wasm")),
        wasmSrcCodeDir: path.join(__dirname, "../../staking/src"),
        wasmGlueCode: path.join(__dirname, "../../staking/pkg/staking-contract.js"),
    });

    console.log("Deployed Staking contract: ", deployment.contractTxId);
    setContractTxId(warp.environment, "staking", deployment.contractTxId);
})();





