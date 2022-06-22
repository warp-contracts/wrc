const fs = require('fs');
const path = require('path');
const { WarpNodeFactory } = require('warp-contracts');
const { mineBlock } = require('./utils/mine-block');
const { loadWallet, walletAddress } = require('./utils/load-wallet');
const { connectArweave } = require('./utils/connect-arweave');

module.exports.deploy = async function (host, port, protocol, target, walletJwk) {
  const arweave = connectArweave(host, port, protocol);
  const warp = WarpNodeFactory.forTesting(arweave)
  const wallet = await loadWallet(arweave, walletJwk, target);
  const walletAddr = await walletAddress(arweave, wallet);
  const contractSrc = fs.readFileSync(path.join(__dirname, '../../pkg/erc20-contract_bg.wasm'));

  let initialState = {
    symbol: "ERC20-test",
    name: "Sample ERC20 token",
    decimals: 18,
    totalSupply: 100,
    balances: {
      [walletAddr]: 100,
    },
    allowances: {},
    settings: null,
    owner: walletAddr,
    canEvolve: true,
    evolve: ""
  };

  const contractTxId = await warp.createContract.deploy(
    {
      wallet,
      initState: JSON.stringify(initialState),
      src: contractSrc,
      wasmSrcCodeDir: path.join(__dirname, '../../src'),
      wasmGlueCode: path.join(__dirname, '../../pkg/erc20-contract.js'),
    },
    target == 'mainnet'
  );
  fs.writeFileSync(path.join(__dirname, `../${target}/contract-tx-id.txt`), contractTxId);

  if (target == 'testnet' || target == 'local') {
    await mineBlock(arweave);
  }

  if (target == 'testnet') {
    console.log(`Check contract at https://sonar.redstone.tools/#/app/contract/${contractTxId}?network=testnet`);
  } else {
    console.log('Contract tx id', contractTxId);
  }
};
