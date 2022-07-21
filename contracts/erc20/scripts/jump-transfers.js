const { getNetwork, getWarp, getContractTxId, loadWallet } = require('warp-contract-utils');

async function jumpTransfer(warp, wallet, erc20) {
  const walletAddress = await warp.arweave.wallets.getAddress(wallet);
  let targetWallet;
  if (warp.environment === 'testnet' || warp.environment === 'local') {
    targetWallet = await warp.testing.generateWallet();
  } else {
    targetWallet = await warp.arweave.wallets.generate();
  }
  const targetAddress = await warp.arweave.wallets.getAddress(targetWallet);

  console.log('Sending: ' + walletAddress + ' -> ' + targetAddress);

  erc20.connect(wallet);
  const transferResponse = await erc20.writeInteraction(
    { function: 'transfer', to: targetAddress, amount: 1 },
    { string: true }
  );

  console.log('Transfer tx id', transferResponse.originalTxId);

  return targetWallet;
}

(async () => {
  const warp = getWarp();
  let [wallet] = await loadWallet(warp, false, __dirname);

  const erc20 = warp.contract(getContractTxId(warp.environment, __dirname)).connect(wallet);

  for (let i = 0; i < 100; i++) {
    wallet = await jumpTransfer(warp, wallet, erc20);
  }
})();
