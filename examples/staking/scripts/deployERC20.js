const fs = require('fs');
const path = require('path');
const { getWarp, setContractTxId, loadWallet } = require('warp-contract-utils');
const { contractSrc, wasmGlueCode, wasmSrcCodeDir } = require('erc20/utils');
//LoggerFactory.INST.logLevel('debug', 'WasmContractHandlerApi');

(async () => {
  const warp = getWarp();
  const [ownerWallet, ownerAddress] = await loadWallet(warp, true, __dirname);

  let initialERC20State = {
    settings: null,
    symbol: 'ERC20-test',
    name: 'Sample ERC20 token',
    decimals: 18,
    totalSupply: 100,
    balances: {
      [ownerAddress]: 100,
    },
    allowances: {},
    owner: ownerAddress,
    canEvolve: true,
    evolve: '',
  };

  let deployment = await warp.deploy({
    wallet: ownerWallet,
    initState: JSON.stringify(initialERC20State),
    src: fs.readFileSync(contractSrc),
    wasmSrcCodeDir: wasmSrcCodeDir,
    wasmGlueCode: wasmGlueCode
  });

  console.log('Deployed ERC20 contract: ', deployment.contractTxId);

  setContractTxId(warp.environment, deployment.contractTxId, __dirname, 'erc20');
})();
