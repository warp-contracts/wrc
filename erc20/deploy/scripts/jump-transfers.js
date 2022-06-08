const { loadWallet } = require('./utils/load-wallet');
const { connectArweave } = require('./utils/connect-arweave');
const { connectPstContract } = require('./utils/connect-pst-contract');
const { contractTxId } = require('./utils/contract-tx-id');
const { mineBlock } = require('./utils/mine-block');
const {connectContract} = require("./utils/connect-contract");
const {addFunds} = require("./utils/addFunds");

async function jumpTransfer(
    arweave,
    target,
    wallet,
    erc20
) {
    erc20.connect(wallet);
    const targetWallet = await arweave.wallets.generate();
    await addFunds(arweave, targetWallet);
    const targetAddress = await arweave.wallets.getAddress(targetWallet);

    const walletAddress = await arweave.wallets.getAddress(wallet);

    console.log("Sending: " + walletAddress +   " -> " + targetAddress);

    const response = await erc20.viewState({ function: "balance", target: walletAddress});

    console.log("Current sender balance: " + response.result.balance);

    if (target == 'mainnet') {
        const transferTx = await erc20.bundleInteraction({ function: "transfer", to: targetAddress, amount: 1},
            undefined, undefined, true // Strict mode to try dry-run first and report errors
        );
        console.log(
            `Check transfer interaction at https://sonar.redstone.tools/#/app/interaction/${transferTx.originalTxId}`
        );
    } else {
        await mineBlock(arweave);
        const transferId = await erc20.writeInteraction({ function: "transfer", to: targetAddress, amount: 1},
            undefined, undefined, true // Strict mode to try dry-run first and report errors
        );
        await mineBlock(arweave);
        console.log('Transfer tx id', transferId);
    }
    return targetWallet;
};

module.exports.jumpTransfers = async function (
    host,
    port,
    protocol,
    target,
    walletJwk
) {
    const arweave = connectArweave(host, port, protocol);
    let wallet = await loadWallet(arweave, walletJwk, target, true);

    let erc20 = await connectContract(arweave, wallet, contractTxId(target), target);

    for (let i=0; i<100; i++) {
        wallet = await jumpTransfer(arweave, target, wallet, erc20);
    }

    //  const state = await erc20.readState();
    // console.log('Updated state:', state);
}
