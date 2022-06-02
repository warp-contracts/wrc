const { SmartWeaveNodeFactory } = require('redstone-smartweave');

module.exports.connectContract = async function (
  arweave,
  wallet,
  contractTxId,
  target
) {
  if (target === "mainnet") {
    return SmartWeaveNodeFactory.memCachedBased(arweave)
        .useRedStoneGateway()
        .build()
        .contract(contractTxId)
        .connect(wallet);
  } else  {
    return SmartWeaveNodeFactory.memCached(arweave)
        .contract(contractTxId)
        .connect(wallet);

  }

};
