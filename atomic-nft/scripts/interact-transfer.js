const { getWarp, loadWallet, getContractTxId, saveTmpWallet } = require('./utils');

(async () => {
  const warp = getWarp();
  const [wallet, address] = await loadWallet(warp, false, 'user_1');
  console.log(address);
  const target = await warp.testing.generateWallet();
  await saveTmpWallet(warp, target, 'user_2');
  const targetAddress = await warp.arweave.wallets.getAddress(target);

  const atomicNFT = warp.contract(getContractTxId(warp.environment)).connect(wallet);

  const interaction = await atomicNFT.writeInteraction(
    { function: 'transfer', to: targetAddress, amount: 200000 },
    { strict: true }
  );

  console.log('Transfer tx id', interaction.originalTxId);
})();
