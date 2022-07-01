const Arweave = require('arweave');
const { WarpFactory, HandlerBasedContract} = require('warp-contracts');

const {loadContractTxId, loadWallet} = require('./utils.js');

let arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https',
});

const warp = WarpFactory.warpGw(arweave);

let ownerWallet, ownerAddress;
let erc20TxId, stakingTxId;


//LoggerFactory.INST.logLevel('debug', 'WasmContractHandlerApi');

async function approve(amount) {
    let erc20 = new HandlerBasedContract(erc20TxId, warp)
        .setEvaluationOptions({internalWrites: true});

    erc20 = erc20.connect(ownerWallet);

    let tx = await erc20.bundleInteraction({ function: "approve", spender: stakingTxId, amount: amount},
        undefined, true // Strict mode to try dry-run first and report errors
    )

    console.log("Transaction sent: " + tx.originalTxId);
    console.log(tx);
}

async function stake(amount) {
    let staking = new HandlerBasedContract(stakingTxId, warp)
        .setEvaluationOptions({internalWrites: true});

    staking = staking.connect(ownerWallet);

    let tx = await staking.bundleInteraction({ function: "stake", amount: amount},
        undefined, true // Strict mode to try dry-run first and report errors
    )

    console.log("Transaction sent: " + tx.originalTxId);
    console.log(tx);
}


async function withdraw(amount) {
    let staking = new HandlerBasedContract(stakingTxId, warp)
        .setEvaluationOptions({internalWrites: true});

    staking = staking.connect(ownerWallet);

    let tx = await staking.bundleInteraction({ function: "withdraw", amount: amount},
        undefined, true // Strict mode to try dry-run first and report errors
    )

    console.log("Transaction sent: " + tx.originalTxId);
    console.log(tx);
}

async function showStakingState() {
    let staking = new HandlerBasedContract(stakingTxId, warp)
        .setEvaluationOptions({internalWrites: true});

    //const staking = warp.contract("x_BaQLFyaEnROLhSUYOfn3nG_wZ3knA_3hAeKLw1lNk");

    staking = staking.connect(ownerWallet);

    console.log("Current Staking state:");
    let state = await staking.readState();
    console.log(JSON.stringify(state, null, " "));
}

async function approveAndStake() {
    [ownerWallet, ownerAddress] = await loadWallet();
    erc20TxId = loadContractTxId("erc20");
    stakingTxId = loadContractTxId("staking");
    await approve(10);
    await stake(1);
    //await stake(1);
    //await withdraw(1);
    showStakingState();
}

approveAndStake();





