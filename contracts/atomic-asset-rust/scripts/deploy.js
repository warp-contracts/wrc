const fs = require('fs');
const path = require('path');
const { getWarp, setContractTxId, loadWallet } = require('warp-contract-utils');
const { ArweaveSigner } = require('warp-contracts-plugin-deploy');

(async () => {
  const warp = getWarp();
  const [wallet, walletAddress] = await loadWallet(warp, true, __dirname);
  const contractSrc = fs.readFileSync(path.join(__dirname, '../pkg/atomic-asset-contract_bg.wasm'));
  const assetPath = fs.readFileSync(path.join(__dirname, './assets/candies.jpeg'));

  let initialState = {
    description: 'This is the test deploy of Atomic Asset token',
    symbol: 'atomic-asset-test',
    name: 'Sample Atomic Asset token',
    decimals: 6,
    totalSupply: 1000000,
    balances: {
      [walletAddress]: 1000000,
    },
    allowances: {},
    owner: walletAddress,
  };

  const deployment = await warp.deploy({
    wallet: new ArweaveSigner(wallet),
    initState: JSON.stringify(initialState),
    src: contractSrc,
    wasmSrcCodeDir: path.join(__dirname, '../src'),
    wasmGlueCode: path.join(__dirname, '../pkg/atomic-asset-contract.js'),
    data: { 'Content-Type': 'image/jpeg', body: assetPath },
  });

  setContractTxId(warp.environment, deployment.contractTxId, __dirname);

  console.log('Contract tx id: ', deployment.contractTxId);

  if (warp.environment == 'mainnet') {
    console.log(`Contract data: https://gateway.redstone.finance/gateway/contract-data/${deployment.contractTxId}`);
  } else if (warp.environment == 'testnet') {
    console.log(`Contract data: https://testnet.redstone.tools/${deployment.contractTxId}`);
  }
})();
