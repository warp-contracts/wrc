const { loadWallet } = require('./utils/load-wallet');
const { connectArweave } = require('./utils/connect-arweave');
const { connectPstContract } = require('./utils/connect-pst-contract');
const { contractTxId } = require('./utils/contract-tx-id');
const { mineBlock } = require('./utils/mine-block');
const {connectContract} = require("./utils/connect-contract");

async function jumpTransfer(
    arweave,
    target,
    wallet
) {
    let erc20 = await connectContract(arweave, wallet, contractTxId(target), target);
    const targetWallet = await arweave.wallets.generate();
    const targetAddress = await arweave.wallets.getAddress(targetWallet);

    const walletAddress = await arweave.wallets.getAddress(wallet);

    console.log("Sending: " + walletAddress +   " -> " + targetAddress);

    if (target == 'mainnet') {
        const transferTx = await erc20.bundleInteraction({ function: "transfer", target: targetAddress, qty: 1},
            undefined, undefined, true // Strict mode to try dry-run first and report errors
        );
        console.log(
            `Check transfer interaction at https://sonar.redstone.tools/#/app/interaction/${transferTx.originalTxId}`
        );
    } else {
        await mineBlock(arweave);
        const transferId = await erc20.writeInteraction({ function: "transfer", target: targetAddress, qty: 1},
            undefined, undefined, true // Strict mode to try dry-run first and report errors
        );
        console.log('Transfer tx id', transferId);
        await mineBlock(arweave);
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

    for (let i=0; i<100; i++) {
        wallet = await jumpTransfer(arweave, target, wallet);
    }

    let erc20 = await connectContract(arweave, wallet, contractTxId(target), target);
    const state = await erc20.readState();
    console.log('Updated state:', state);
}
