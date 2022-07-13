const { getWarp, loadWallet, getContractTxId } = require('./utils');

(async () => {
  const warp = getWarp();
  const [backWallet] = await loadWallet(warp, false, 'user_2');
  const [, address] = await loadWallet(warp, false, 'user_1');

  const atomicNFT = warp.contract(getContractTxId(warp.environment)).connect(backWallet);

  const interaction = await atomicNFT.writeInteraction(
    { function: 'transfer', to: address, amount: 200000 },
    { strict: true }
  );

  console.log('Transfer tx id', interaction.originalTxId);
})();
