const { getWarp, loadWallet, getContractTxId, } = require('warp-contract-utils');

(async () => {
  const warp = getWarp();
  const [wallet] = await loadWallet(warp, false, __dirname);
  const target = await warp.arweave.wallets.generate();
  const targetAddress = await warp.arweave.wallets.getAddress(target);

  const atomicAsset = warp.contract(getContractTxId(warp.environment, __dirname)).connect(wallet);

  const interaction = await atomicAsset.writeInteraction(
    { function: 'transfer', to: targetAddress, amount: 1 },
    { strict: true }
  );

  console.log('Transfer tx id', interaction.originalTxId);
})();
