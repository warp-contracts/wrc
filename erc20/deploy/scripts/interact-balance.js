const { loadWallet } = require('./utils/load-wallet');
const { connectArweave } = require('./utils/connect-arweave');
const { connectPstContract } = require('./utils/connect-pst-contract');
const { contractTxId } = require('./utils/contract-tx-id');
const { HandlerBasedContract, SmartWeaveNodeFactory} = require('redstone-smartweave');
const {connectContract} = require("./utils/connect-contract");

module.exports.interactBalance = async function (
  host,
  port,
  protocol,
  target,
  walletJwk
) {
  const arweave = connectArweave(host, port, protocol);
  const wallet = await loadWallet(arweave, walletJwk, target, true);

  const walletAddress = await arweave.wallets.jwkToAddress(wallet);

  const erc20 = await connectContract(arweave, wallet, contractTxId(target), target);

  const balance = await erc20.viewState({ function: "balanceOf", target: walletAddress});

  console.log(balance);
};
