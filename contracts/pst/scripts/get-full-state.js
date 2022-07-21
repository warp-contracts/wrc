const { getWarp, loadWallet, getContractTxId, getNetwork } = require('warp-contract-utils');

(async () => {
  const warp = getWarp();
  const [wallet] = await loadWallet(warp, false, __dirname);

  const pst = warp.contract(getContractTxId(warp.environment, __dirname)).connect(wallet);
  const state = await pst.readState();
  console.log(state);
})();
