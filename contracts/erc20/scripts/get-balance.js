const { getWarp, getContractTxId, loadWallet, getNetwork } = require('warp-contract-utils');

(async () => {
  const warp = getWarp();
  const [wallet, walletAddress] = await loadWallet(warp, false, __dirname);

  const erc20 = warp.contract(getContractTxId(warp.environment, __dirname)).connect(wallet);
  const queryResponse = await erc20.viewState({ function: 'balanceOf', target: walletAddress });

  console.log('Balance: ' + queryResponse.result.balance);
})();
