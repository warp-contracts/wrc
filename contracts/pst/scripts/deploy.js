const fs = require('fs');
const path = require('path');
const { getWarp, setContractTxId, loadWallet } = require('warp-contract-utils');

(async () => {
  const warp = getWarp();
  const [wallet, walletAddress] = await loadWallet(warp, true, __dirname);
  const contractSrc = fs.readFileSync(path.join(__dirname, '../pkg/pst-contract_bg.wasm'));

  let initialState = {
    evolve: '',
    ticker: 'PST TMPL RUST',
    name: 'PST Template Rust',
    canEvolve: true,
    owner: walletAddress,
    balances: {
      [walletAddress]: 10000000,
    },
  };

  const deployment = await warp.createContract.deploy({
    wallet,
    initState: JSON.stringify(initialState),
    src: contractSrc,
    wasmSrcCodeDir: path.join(__dirname, '../src'),
    wasmGlueCode: path.join(__dirname, '../pkg/pst-contract.js'),
  });

  setContractTxId(warp.environment, deployment.contractTxId, __dirname);

  console.log('Contract tx id: ', deployment.contractTxId);
})();
