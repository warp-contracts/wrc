const { WarpNodeFactory } = require('warp-contracts');

module.exports.connectContract = async function (
  arweave,
  wallet,
  contractTxId,
  target
) {
  if (target === "mainnet") {
    return WarpNodeFactory.memCachedBased(arweave).useWarpGateway().build()
        .contract(contractTxId)
        .connect(wallet);
  } else  {
    return WarpNodeFactory.forTesting(arweave)
        .contract(contractTxId)
        .connect(wallet);

  }

};
