const { WarpFactory, defaultCacheOptions, TagsParser } = require('warp-contracts');
const path = require('path');
const fs = require('fs');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { DeployPlugin } = require('warp-contracts-plugin-deploy');
const argv = yargs(hideBin(process.argv)).argv;

getTmpContractTxIdPath = function (network, dir, name) {
  return path.join(dir, `./tmp/${network}_contract-tx-id${name ? `-${name}` : ''}.txt`);
};

module.exports.setContractTxId = function (network, contractTxId, dir, name) {
  try {
    fs.writeFileSync(path.join(dir, `./tmp/${network}_contract-tx-id${name ? `-${name}` : ''}.txt`), contractTxId);
  } catch (e) {
    throw new Error(`No such file or directory. Maybe you forgot to create 'tmp' folder in 'scripts' directory?`);
  }
};

module.exports.getContractTxId = function (network, dir, name) {
  let txId;
  try {
    txId = fs.readFileSync(getTmpContractTxIdPath(network, dir, name)).toString().trim();
  } catch (e) {
    throw new Error('Contract tx id file not found! Please run deploy script first.');
  }
  return txId;
};

module.exports.getWarp = function () {
  const network = getNetwork();
  if (network == 'local') {
    return WarpFactory.forLocal(1984).use(new DeployPlugin());
  } else if (network == 'testnet') {
    return WarpFactory.forTestnet().use(new DeployPlugin());
  } else if (network == 'mainnet') {
    return WarpFactory.forMainnet({ ...defaultCacheOptions, inMemory: true }).use(new DeployPlugin());
  } else {
    throw new Error('Unknown network: ' + network);
  }
};

module.exports.loadWallet = async function (warp, generate, dir) {
  let wallet;
  let walletDir = path.join(dir, '../scripts/.secrets');
  let walletFilename = path.join(walletDir, `/wallet_${warp.environment}.json`);
  if (generate) {
    console.log('GENERATING wallet');
    if (warp.environment === 'local' || warp.environment === 'testnet') {
      wallet = await warp.testing.generateWallet();
    } else {
      wallet = await warp.arweave.wallets.generate();
    }
    if (!fs.existsSync(walletDir)) fs.mkdirSync(walletDir);
    fs.writeFileSync(walletFilename, JSON.stringify(wallet));
  } else {
    try {
      wallet = JSON.parse(fs.readFileSync(walletFilename, 'utf-8'));
    } catch (e) {
      throw new Error('Wallet file not found! Please deploy the contract first');
    }
  }
  let address = await warp.arweave.wallets.getAddress(wallet);
  return [wallet, address];
};

module.exports.getTag = function getTag(tx, name) {
  const tagParser = new TagsParser();

  return tagParser.getTag(tx, name)
}

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

module.exports.getNetwork = getNetwork;
