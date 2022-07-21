const fs = require('fs');
const path = require('path');
const { getWarp, setContractTxId, loadWallet } = require('warp-contract-utils');

(async () => {
  const warp = getWarp();
  const [wallet, walletAddress] = await loadWallet(warp, true, __dirname);
  const contractSrc = fs.readFileSync(path.join(__dirname, '../pkg/erc20-contract_bg.wasm'));

  let initialState = {
    symbol: 'ERC20-test',
    name: 'Sample ERC20 token',
    decimals: 18,
    totalSupply: 100,
    balances: {
      [walletAddress]: 100,
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
    wasmGlueCode: path.join(__dirname, '../pkg/erc20-contract.js'),
  });

  setContractTxId(warp.environment, deployment.contractTxId, __dirname);

  console.log('Contract tx id: ', deployment.contractTxId);
})();
