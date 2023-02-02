const { getWarp, getContractTxId, loadWallet } = require('warp-contract-utils');

(async () => {
  const warp = getWarp();
  const [wallet, walletAddress] = await loadWallet(warp, false, __dirname);

  const atomicAsset = warp.contract(getContractTxId(warp.environment, __dirname)).connect(wallet);
  const queryResponse = await atomicAsset.viewState({ function: 'balanceOf', target: walletAddress });

  console.log('Balance: ' + queryResponse.result.balance);
})();
