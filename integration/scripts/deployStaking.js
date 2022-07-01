const Arweave = require('arweave');
const { WarpFactory, HandlerBasedContract} = require('warp-contracts');
const fs = require("fs");
const path = require("path");

const {loadContractTxId, saveContractId, loadWallet} = require('./utils.js');

let arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https',
});

const warp = WarpFactory.warpGw(arweave);

let ownerWallet, ownerAddress;

//LoggerFactory.INST.logLevel('debug', 'WasmContractHandlerApi');

async function deployStakingContract() {
    [ownerWallet, ownerAddress] = await loadWallet()
    let erc20TxId = loadContractTxId("erc20");

    let initialStakingState = {
        canEvolve: true,
        evolve: "",
        settings: null,
        owner: ownerAddress,
        token: erc20TxId,
        stakes: {}
    };

    let stakingTxId = await warp.createContract.deploy({
        wallet: ownerWallet,
        initState: JSON.stringify(initialStakingState),
        src: fs.readFileSync(path.join(__dirname, "../../staking/pkg/staking-contract_bg.wasm")),
        wasmSrcCodeDir: path.join(__dirname, "../../staking/src"),
        wasmGlueCode: path.join(__dirname, "../../staking/pkg/staking-contract.js"),
    }, true)

    console.log("Deployed Staking contract: ", stakingTxId);
    saveContractId("staking", stakingTxId);
}

deployStakingContract();





