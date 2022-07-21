const { getWarp, getContractTxId, loadWallet, getNetwork } = require('warp-contract-utils');

(async () => {
  const warp = getWarp();
  const [wallet, walletAddress] = await loadWallet(warp, false, __dirname);

  const pst = warp.contract(getContractTxId(warp.environment, __dirname)).connect(wallet);
  const queryResponse = await pst.viewState({ function: 'balance', target: walletAddress });

  console.log('Balance: ' + queryResponse.result.balance);
})();
