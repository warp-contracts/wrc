const fs = require('fs');
const path = require('path');
const { getWarp, setContractTxId, loadWallet, getNetwork } = require('./utils');

//LoggerFactory.INST.logLevel('debug', 'WasmContractHandlerApi');

(async () => {
    const warp = getWarp();
    const [ownerWallet, ownerAddress] = await loadWallet(warp, true);

    let initialERC20State = {
        settings: null,
        symbol: "ERC20-test",
        name: "Sample ERC20 token",
        decimals: 18,
        totalSupply: 100,
        balances: {
            [ownerAddress]: 100,
        },
        allowances: {},
        owner: ownerAddress,
        canEvolve: true,
        evolve: ""
    };

    let deployment = await warp.createContract.deploy({
        wallet: ownerWallet,
        initState: JSON.stringify(initialERC20State),
        src: fs.readFileSync(path.join(__dirname, "../../erc20/pkg/erc20-contract_bg.wasm")),
        wasmSrcCodeDir: path.join(__dirname, "../../erc20/src"),
        wasmGlueCode: path.join(__dirname, "../../erc20/pkg/erc20-contract.js"),
    });

    console.log("Deployed ERC20 contract: ", deployment.contractTxId);

    setContractTxId(warp.environment, "erc20", deployment.contractTxId)
})();



