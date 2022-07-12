const {getWarp, loadWallet, getContractTxId} = require("./utils");




//LoggerFactory.INST.logLevel('debug', 'WasmContractHandlerApi');

async function approve(erc20, stakingTxId, amount) {
    console.log("Approving: " + stakingTxId + " for: " + amount);
    let interaction = await erc20.writeInteraction(
        {function: "approve", spender: stakingTxId, amount: amount},
        {strict: true}
    );

    console.log("Approval transaction sent: " + interaction.originalTxId);
}

async function stake(staking, amount) {
    let interaction = await staking.writeInteraction(
        {function: "stake", amount},
        // Uncomment this line to reproduce the error
        //{strict: true}
    );

    console.log("Staking transaction sent: " + interaction.originalTxId);
}


async function withdraw(staking, amount) {
    let interaction = await staking.writeInteraction(
        {function: "withdraw", amount},
        {strict: true}
    );

    console.log("Withdrawal transaction sent: " + interaction.originalTxId);
}

async function showContractState(contract) {
    const state = await contract.readState();
    console.log(JSON.stringify(state, null, 2));
}

async function approveAndStake() {
    let warp = getWarp();
    [ownerWallet, ownerAddress] = await loadWallet(warp, );

    const erc20 = warp.contract(getContractTxId(warp.environment, "erc20"))
                      .setEvaluationOptions({internalWrites: true})
                      .connect(ownerWallet);

    const stakingTxId = getContractTxId(warp.environment, "staking");
    const staking = warp.contract(stakingTxId)
                        .setEvaluationOptions({internalWrites: true})
                        .connect(ownerWallet);

    await approve(erc20, stakingTxId, 5);
    await stake(staking, 1);
    await stake(staking, 1);
    await stake(staking, 1);
    await withdraw(staking, 1);

    await showContractState(erc20);
    await showContractState(staking);
}

approveAndStake();





