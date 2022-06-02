const { interactTransferFrom } = require('../scripts/interact-transfer-from');

interactTransferFrom(
    'arweave.net',
    443,
    'https',
    'mainnet',
    'deploy/mainnet/.secrets/wallet_mainnet.json'
).finally();
