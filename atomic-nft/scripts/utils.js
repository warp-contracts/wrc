const { WarpFactory } = require('warp-contracts');
const path = require('path');
const fs = require('fs');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const net = require('net');
const argv = yargs(hideBin(process.argv)).argv;

getTmpContractTxIdPath = function (network) {
  return path.join(__dirname, `./tmp/${network}_contract-tx-id.txt`);
};

module.exports.setContractTxId = function (network, contractTxId) {
  fs.writeFileSync(path.join(__dirname, `./tmp/${network}_contract-tx-id.txt`), contractTxId);
};

module.exports.getContractTxId = function (network) {
  let txId;
  try {
    txId = fs.readFileSync(getTmpContractTxIdPath(network)).toString().trim();
  } catch (e) {
    throw new Error('Contract tx id file not found! Please run deploy script first.');
  }
  return txId;
};

module.exports.getWarp = function () {
  const network = getNetwork();
  if (network == 'local') {
    return WarpFactory.forLocal(1984);
  } else if (network == 'testnet') {
    return WarpFactory.forTestnet();
  } else if (network == 'mainnet') {
    return WarpFactory.forMainnet();
  } else {
    throw new Error('Unknown network: ' + network);
  }
};

module.exports.loadWallet = async function (warp, generate, name) {
  let wallet;
  if (generate && (warp.environment === 'local' || warp.environment === 'testnet')) {
    console.log('GENERATING test env wallet');
    wallet = await warp.testing.generateWallet();
    saveTmpWallet(warp, wallet, name);
  } else {
    try {
      const walletFilename = getWalletFilename(warp, name);
      wallet = JSON.parse(fs.readFileSync(walletFilename, 'utf-8'));
    } catch (e) {
      throw new Error('Wallet file not found! Please deploy the contract first');
    }
  }
  let address = await warp.arweave.wallets.getAddress(wallet);
  return [wallet, address];
};

const getNetwork = function () {
  if (!argv.network) {
    throw new Error('Network not specified please run the script with --network parameter');
  }
  if (argv.network != 'local' && argv.network != 'testnet' && argv.network != 'mainnet') {
    throw new Error('Network must be one of local|testnet|mainnet');
  }
  console.log('NETWORK: ' + argv.network);
  return argv.network;
};

saveTmpWallet = function (warp, wallet, name) {
  const walletFilename = getWalletFilename(warp, name);
  fs.writeFileSync(walletFilename, JSON.stringify(wallet));
};

getWalletFilename = function (warp, name) {
  const walletFilename = path.join(
    __dirname,
    `../scripts/.secrets/wallet_${warp.environment}${name ? `_${name}` : ''}.json`
  );
  return walletFilename;
};

module.exports.getNetwork = getNetwork;
module.exports.saveTmpWallet = saveTmpWallet;
