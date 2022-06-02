const { jumpTransfers} = require('../scripts/jump-transfers');

jumpTransfers(
    'testnet.redstone.tools',
    443,
    'https',
    'testnet',
    'deploy/testnet/wallet_testnet.json'
).finally();
