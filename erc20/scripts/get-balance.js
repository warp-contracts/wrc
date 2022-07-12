const { getWarp, getContractTxId, loadWallet, getNetwork} = require('./utils');

(async () => {
  const warp = getWarp();
  const [wallet, walletAddress] = await loadWallet(warp);

  const erc20 = warp.contract(getContractTxId(warp.environment)).connect(wallet);
  const queryResponse = await erc20.viewState({ function: "balanceOf", target: walletAddress});

  console.log("Balance: " + queryResponse.result.balance);
})();