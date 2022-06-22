const { loadWallet } = require('./utils/load-wallet');
const { connectArweave } = require('./utils/connect-arweave');
const { connectContract } = require('./utils/connect-contract');
const { connectPstContract } = require('./utils/connect-pst-contract');
const { contractTxId } = require('./utils/contract-tx-id');
const { mineBlock } = require('./utils/mine-block');
const {SmartWeaveNodeFactory, HandlerBasedContract} = require("redstone-smartweave");
const {addFunds} = require("./utils/addFunds");

module.exports.interactTransferFrom = async function (
    host,
    port,
    protocol,
    target,
    walletJwk
) {
    const arweave = connectArweave(host, port, protocol);
    const wallet = await loadWallet(arweave, walletJwk, target, true);
    const walletAddress = await arweave.wallets.getAddress(wallet);

    const targetWallet = await arweave.wallets.generate();
    const targetAddress = await arweave.wallets.getAddress(targetWallet);

    const erc20 = await connectContract(arweave, wallet, contractTxId(target), target);
    const erc20FromTarget = await connectContract(arweave, targetWallet, contractTxId(target), target);


    if (target === 'mainnet') {
        const approveTx = await erc20.bundleInteraction({ function: "approve", spender: targetAddress, amount: 1},
            undefined, undefined, true // Strict mode to try dry-run first and report errors
        );
        console.log(
            `Check approve interaction at https://sonar.redstone.tools/#/app/interaction/${approveTx.originalTxId}`
        );
        const transferTx = await erc20FromTarget.bundleInteraction({
                function: "transferFrom",
                from: walletAddress,
                to: targetAddress,
                amount: 1
            },
            undefined, undefined, true // Strict mode to try dry-run first and report errors
        );
        console.log(
            `Check transfer interaction at https://sonar.redstone.tools/#/app/interaction/${transferTx.originalTxId}`
        );


    } else {
        const approveId = await erc20.writeInteraction({ function: "approve", spender: targetAddress, amount: 1},
            undefined, undefined, true // Strict mode to try dry-run first and report errors
        );
        console.log('Approve tx id', approveId);
        await mineBlock(arweave);

        await addFunds(arweave, targetWallet);
        const transferId = await erc20FromTarget.writeInteraction({
                function: "transferFrom",
                from: walletAddress,
                to: targetAddress,
                amount: 1
            },
            undefined, undefined, true // Strict mode to try dry-run first and report errors
        );
        await mineBlock(arweave);
        console.log('Transfer tx id', transferId);
    }

    const state = await erc20.readState();

    console.log('Updated state:', state);
};
