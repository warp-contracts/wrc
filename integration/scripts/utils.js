const Arweave = require('arweave');
const fs = require("fs");
const path = require("path");

let arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https',
});

module.exports.loadContractTxId = function (contract) {
    let txId;
    try {
        txId = fs
            .readFileSync(
                path.join(__dirname, `./deployments/${contract}-tx-id.txt`),
                'utf-8'
            ).trim();
    } catch (e) {
        throw new Error('Contract tx id file not found! Please run deploy script first.');
    }
    return txId;
};

module.exports.saveContractId = function(contract, txId) {
    fs.writeFileSync(path.join(__dirname, `./deployments/${contract}-tx-id.txt`), txId);
}

module.exports.loadWallet = async function() {
    let ownerWallet = JSON.parse(fs.readFileSync(path.join(__dirname + "/../../secrets/wallet.json")));
    let ownerAddress = await arweave.wallets.getAddress(ownerWallet);
    console.log("Connected wallet: " + ownerAddress);
    return [ownerWallet, ownerAddress];
}