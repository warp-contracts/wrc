const { loadWallet } = require('./utils/load-wallet');
const { connectArweave } = require('./utils/connect-arweave');
const { connectContract } = require('./utils/connect-contract');
const { connectPstContract } = require('./utils/connect-pst-contract');
const { contractTxId } = require('./utils/contract-tx-id');
const { mineBlock } = require('./utils/mine-block');
const {SmartWeaveNodeFactory, HandlerBasedContract} = require("redstone-smartweave");

module.exports.interactTransfer = async function (
  host,
  port,
  protocol,
  target,
  walletJwk
) {
  const arweave = connectArweave(host, port, protocol);
  const wallet = await loadWallet(arweave, walletJwk, target, true);

  const targetWallet = await arweave.wallets.generate();
  const targetAddress = await arweave.wallets.getAddress(targetWallet);

  const erc20 = await connectContract(arweave, wallet, contractTxId(target), target);

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
  }

  const state = await erc20.readState();

  console.log('Updated state:', state);
};
