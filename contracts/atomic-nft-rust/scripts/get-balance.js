const { getWarp, getContractTxId, loadWallet } = require('warp-contract-utils');

(async () => {
  const warp = getWarp();
  const [wallet, walletAddress] = await loadWallet(warp, false, __dirname);

  const atomicNFT = warp.contract(getContractTxId(warp.environment, __dirname)).connect(wallet);
  const queryResponse = await atomicNFT.viewState({ function: 'balanceOf', target: walletAddress });

  console.log('Balance: ' + queryResponse.result.balance);
})();
