const {getWarp, loadWallet, getContractTxId, getNetwork} = require("./utils");

(async () => {
  const warp = getWarp();
  const [wallet, ] = await loadWallet(warp);
  const target = await warp.arweave.wallets.generate();
  const targetAddress = await warp.arweave.wallets.getAddress(target);

  const erc20 = warp.contract(getContractTxId(warp.environment)).connect(wallet);

  const interaction = await erc20.writeInteraction(
    { function: "transfer", to: targetAddress, amount: 1},
    {strict: true}
  );

  console.log('Transfer tx id', interaction.originalTxId);
})();
