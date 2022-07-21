const { getWarp, loadWallet, getContractTxId } = require('./utils');

(async () => {
  const warp = getWarp();
  const [wallet] = await loadWallet(warp);

  const atomicNFT = warp.contract(getContractTxId(warp.environment)).connect(wallet);
  const state = await atomicNFT.readState();
  console.log(state);
})();
