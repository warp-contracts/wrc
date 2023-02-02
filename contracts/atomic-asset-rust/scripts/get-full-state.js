const { getWarp, loadWallet, getContractTxId, getNetwork } = require('warp-contract-utils');

(async () => {
  const warp = getWarp();
  const [wallet] = await loadWallet(warp, false, __dirname);

  const atomicAsset = warp.contract(getContractTxId(warp.environment, __dirname)).connect(wallet);
  const state = await atomicAsset.readState();
  console.log(state);
})();
