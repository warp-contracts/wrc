const { WarpFactory } = require('warp-contracts');

module.exports.connectContract = async function (
  arweave,
  wallet,
  contractTxId,
  target
) {
  if (target === "mainnet") {
    return WarpFactory.warpGw(arweave)
        .contract(contractTxId)
        .connect(wallet);
  } else  {
    return WarpFactory.forTesting(arweave)
        .contract(contractTxId)
        .connect(wallet);

  }

};
