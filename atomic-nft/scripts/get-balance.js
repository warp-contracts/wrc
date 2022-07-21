const { getWarp, getContractTxId, loadWallet } = require('./utils');

(async () => {
  const warp = getWarp();
  const [wallet, walletAddress] = await loadWallet(warp);

  const atomicNFT = warp.contract(getContractTxId(warp.environment)).connect(wallet);
  const queryResponse = await atomicNFT.viewState({ function: 'balanceOf', target: walletAddress });

  console.log('Balance: ' + queryResponse.result.balance);
})();
