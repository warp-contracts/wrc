const { getWarp, loadWallet, getContractTxId, getNetwork } = require('warp-contract-utils');

(async () => {
  const warp = getWarp();
  const [wallet] = await loadWallet(warp, false, __dirname);
  const target = await warp.arweave.wallets.generate();
  const targetAddress = await warp.arweave.wallets.getAddress(target);

  const atomicNFT = warp.contract(getContractTxId(warp.environment, __dirname)).connect(wallet);

  const interaction = await atomicNFT.writeInteraction(
    { function: 'transfer', to: targetAddress, amount: 1 },
    { strict: true }
  );

  console.log('Transfer tx id', interaction.originalTxId);
})();
