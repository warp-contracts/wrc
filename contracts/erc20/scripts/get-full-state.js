const { getWarp, loadWallet, getContractTxId, getNetwork } = require('warp-contract-utils');

(async () => {
  const warp = getWarp();
  const [wallet] = await loadWallet(warp, false, __dirname);

  const erc20 = warp.contract(getContractTxId(warp.environment, __dirname)).connect(wallet);
  const state = await erc20.readState();
  console.log(state);
})();
