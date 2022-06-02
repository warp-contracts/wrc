const { jumpTransfers } = require('../scripts/jump-transfers');

jumpTransfers(
    'arweave.net',
    443,
    'https',
    'mainnet',
    'deploy/mainnet/.secrets/wallet_mainnet.json'
).finally();
