const Arweave = require('arweave');
const { WarpFactory, HandlerBasedContract} = require('warp-contracts');
const fs = require("fs");
const path = require("path");
const {saveContractId, loadWallet} = require('./utils.js');

let arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https',
});
const warp = WarpFactory.warpGw(arweave);

let ownerWallet, ownerAddress;

//LoggerFactory.INST.logLevel('debug', 'WasmContractHandlerApi');

async function deployERC20() {
    [ownerWallet, ownerAddress] = await loadWallet()

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

    let erc20ContractTxId = await warp.createContract.deploy({
        wallet: ownerWallet,
        initState: JSON.stringify(initialERC20State),
        src: fs.readFileSync(path.join(__dirname, "../../erc20/pkg/erc20-contract_bg.wasm")),
        wasmSrcCodeDir: path.join(__dirname, "../../erc20/src"),
        wasmGlueCode: path.join(__dirname, "../../erc20/pkg/erc20-contract.js"),
    }, true);

    console.log("Deployed ERC20 contract: ", erc20ContractTxId);

    saveContractId("erc20", erc20ContractTxId)
}

deployERC20();




