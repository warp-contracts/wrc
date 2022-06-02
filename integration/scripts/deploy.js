const Arweave = require('arweave');
const { SmartWeaveNodeFactory, HandlerBasedContract} = require('redstone-smartweave');
const fs = require("fs");
const path = require("path");

let arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https',
});
const smartweave = SmartWeaveNodeFactory.memCachedBased(arweave)
    .useRedStoneGateway()
    .build();

let ownerWallet, ownerAddress;
let erc20TxIdId, stakingTxId;


//LoggerFactory.INST.logLevel('debug', 'WasmContractHandlerApi');


async function loadWallet() {
    ownerWallet = JSON.parse(fs.readFileSync(path.join(__dirname + "/../../secrets/wallet.json")));
    ownerAddress = await arweave.wallets.getAddress(ownerWallet);
    console.log("Connected wallet: " + ownerAddress);
}


async function deployERC20() {
    let initialERC20State = {
        canEvolve: true,
        evolve: "",
        settings: null,
        ticker: "ERC20-test",
        owner: ownerAddress,
        balances: {
            [ownerAddress]: 100,
        },
        allowances: {}
    };

    let erc20ContractTxId = await smartweave.createContract.deploy({
            wallet: ownerWallet,
            initState: JSON.stringify(initialERC20State),
            src: fs.readFileSync(path.join(__dirname, "../../erc20/pkg/erc20-contract_bg.wasm")),
            wasmSrcCodeDir: path.join(__dirname, "../../erc20/src"),
            wasmGlueCode: path.join(__dirname, "../../erc20/pkg/erc20-contract.js"),
        }, true);

    console.log("Deployed ERC20 contract: ", erc20ContractTxId);
    return erc20ContractTxId;
}

async function deployStakingContract(erc20ContractTxId) {
    let initialStakingState = {
        canEvolve: true,
        evolve: "",
        settings: null,
        owner: ownerAddress,
        token: erc20ContractTxId,
        stakes: {}
    };

    let stakingTxId = await smartweave.createContract.deploy({
            wallet: ownerWallet,
            initState: JSON.stringify(initialStakingState),
            src: fs.readFileSync(path.join(__dirname, "../../staking/pkg/staking-contract_bg.wasm")),
            wasmSrcCodeDir: path.join(__dirname, "../../staking/src"),
            wasmGlueCode: path.join(__dirname, "../../staking/pkg/staking-contract.js"),
        }, true)

    console.log("Deployed Staking contract: ", stakingTxId);
}



async function approve(erc20TxId, stakingTxId, amount) {
    let erc20 = new HandlerBasedContract(erc20TxId, smartweave)
        .setEvaluationOptions({internalWrites: true});

    erc20 = erc20.connect(ownerWallet);

    let tx = await erc20.bundleInteraction({ function: "approve", spender: stakingTxId, amount: amount},
        undefined, true // Strict mode to try dry-run first and report errors
    )

    console.log("Transaction sent: " + tx.originalTxId);
    console.log(tx);

    // console.log("Current state");
    // let state = await erc20.readState();
    // console.log(JSON.stringify(state, null, " "));
}

async function stake(amount) {
    let staking = new HandlerBasedContract(stakingTxId, smartweave)
        .setEvaluationOptions({internalWrites: true});

    staking = staking.connect(ownerWallet);

    let tx = await staking.bundleInteraction({ function: "stake", amount: amount},
        undefined, true // Strict mode to try dry-run first and report errors
    )

    console.log("Transaction sent: " + tx.originalTxId);
    console.log(tx);
}


async function withdraw(amount) {
    let staking = new HandlerBasedContract(stakingTxId, smartweave)
        .setEvaluationOptions({internalWrites: true});

    staking = staking.connect(ownerWallet);

    let tx = await staking.bundleInteraction({ function: "withdraw", amount: amount},
        undefined, true // Strict mode to try dry-run first and report errors
    )

    console.log("Transaction sent: " + tx.originalTxId);
    console.log(tx);
}

async function showStakingState() {
    let staking = new HandlerBasedContract(stakingTxId, smartweave)
        .setEvaluationOptions({internalWrites: true});

    staking = staking.connect(ownerWallet);

    console.log("Current Staking state:");
    let state = await staking.readState();
    console.log(JSON.stringify(state, null, " "));
}

async function deploy() {
    await loadWallet()
    //let erc20TxId = await deployERC20();
    let erc20TxId = "Y_Bk3_ViYIR405l_S40oRyi5CuJnd99O1NQPKUua9_4";
    await deployStakingContract(erc20TxId);
}

async function approveAndStake(erc20TxIdId, stakingTxId) {
    await loadWallet();
    //await approve(erc20TxIdId, stakingTxId, 10);
    //await stake(erc20TxIdId, stakingTxId, 1);
    await stake(1);
    await withdraw(1);
    showStakingState();
}

erc20TxIdId = "Y_Bk3_ViYIR405l_S40oRyi5CuJnd99O1NQPKUua9_4",
stakingTxId = "FhrzoN0mVwc81O5PKZ0CMKCWrfWn1xMh9-oVIn5kE34"

approveAndStake();





