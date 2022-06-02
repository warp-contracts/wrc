const { interactTransfer, jumpTransfers} = require('../scripts/jump-transfers');

jumpTransfers(
    'localhost',
    1984,
    'http',
    'local',
    'deploy/local/wallet_local.json'
).finally();
