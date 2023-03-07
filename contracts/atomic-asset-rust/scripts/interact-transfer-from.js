const { getWarp, getContractTxId, loadWallet } = require('warp-contract-utils');

(async () => {
  const warp = getWarp();
  const [wallet, walletAddress] = await loadWallet(warp, false, __dirname);

  let targetWallet;
  if (warp.environment === 'testnet' || warp.environment === 'local') {
    targetWallet = await warp.testing.generateWallet();
  } else {
    targetWallet = await warp.arweave.wallets.generate();
  }
  const targetAddress = await warp.arweave.wallets.getAddress(targetWallet);

  const atomicAsset = warp.contract(getContractTxId(warp.environment, __dirname)).connect(wallet);
  const atomicAssetFromTarget = warp.contract(getContractTxId(warp.environment, __dirname)).connect(targetWallet);

  const approveId = await atomicAsset.writeInteraction(
    { function: 'approve', spender: targetAddress, amount: 10000 },
    { strict: true }
  );

  console.log('Approve tx id', approveId);

  const transferResponse = await atomicAssetFromTarget.writeInteraction(
    {
      function: 'transferFrom',
      from: walletAddress,
      to: targetAddress,
      amount: 10000,
    },
    { strict: true }
  );
  console.log('Transfer From tx id: ', transferResponse.originalTxId);
})();
