const {getWarp, loadWallet, getContractTxId, getNetwork} = require("./utils");

(async () => {
  const warp = getWarp();
  const [wallet, ] = await loadWallet(warp);

  const erc20 = warp.contract(getContractTxId(warp.environment)).connect(wallet);
  const state = await erc20.readState();
  console.log(state);
})();
