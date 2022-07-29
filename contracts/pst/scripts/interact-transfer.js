const { getWarp, loadWallet, getContractTxId, getNetwork } = require('warp-contract-utils');

(async () => {
  const warp = getWarp();
  const [wallet] = await loadWallet(warp, false, __dirname);
  const target = await warp.arweave.wallets.generate();
  const targetAddress = await warp.arweave.wallets.getAddress(target);

  const pst = warp.contract(getContractTxId(warp.environment, __dirname)).connect(wallet);

  const interaction = await pst.writeInteraction(
    { function: 'transfer', target: targetAddress, qty: 1 },
    { strict: true }
  );

  console.log('Transfer tx id', interaction.originalTxId);
})();
