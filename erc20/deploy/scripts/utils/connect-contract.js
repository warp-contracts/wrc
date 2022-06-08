const { SmartWeaveFactory } = require('redstone-smartweave');

module.exports.connectContract = async function (
  arweave,
  wallet,
  contractTxId,
  target
) {
  if (target === "mainnet") {
    return SmartWeaveFactory.warpGw(arweave)
        .contract(contractTxId)
        .connect(wallet);
  } else  {
    return SmartWeaveFactory.arweaveGw(arweave)
        .contract(contractTxId)
        .connect(wallet);

  }

};
