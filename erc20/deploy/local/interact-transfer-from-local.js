const { interactTransferFrom } = require('../scripts/interact-transfer-from');

interactTransferFrom(
    'localhost',
    1984,
    'http',
    'local',
    'deploy/local/wallet_local.json'
).finally();
