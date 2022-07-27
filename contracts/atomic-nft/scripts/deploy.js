const fs = require('fs');
const path = require('path');
const { getWarp, setContractTxId, loadWallet } = require('warp-contract-utils');

(async () => {
  const warp = getWarp();
  const [wallet, walletAddress] = await loadWallet(warp, true, __dirname);
  const contractSrc = fs.readFileSync(path.join(__dirname, '../pkg/atomic-nft-contract_bg.wasm'));
  const nftAssetPath = fs.readFileSync(path.join(__dirname, './assets/candies.jpeg'));

  let initialState = {
    description: 'This is the test deploy of Atomic NFT token',
    symbol: 'Atomic-NFT-test',
    name: 'Sample Atomic NFT token',
    decimals: 6,
    totalSupply: 1000000,
    balances: {
      [walletAddress]: 1000000,
    },
    allowances: {},
    settings: null,
    owner: walletAddress,
    canEvolve: true,
    evolve: '',
  };

  const deployment = await warp.createContract.deploy({
    wallet,
    initState: JSON.stringify(initialState),
    src: contractSrc,
    wasmSrcCodeDir: path.join(__dirname, '../src'),
    wasmGlueCode: path.join(__dirname, '../pkg/atomic-nft-contract.js'),
    data: { 'Content-Type': 'image/jpeg', body: nftAssetPath },
  });

  setContractTxId(warp.environment, deployment.contractTxId, __dirname);

  console.log('Contract tx id: ', deployment.contractTxId);

  if (warp.environment == 'mainnet') {
    console.log(`Contract data: https://gateway.redstone.finance/gateway/contract-data/${deployment.contractTxId}`);
  } else if (warp.environment == 'testnet') {
    console.log(`Contract data: https://testnet.redstone.tools/${deployment.contractTxId}`);
  }
})();
