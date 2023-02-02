const path = require('path');

module.exports.contractSrc = path.join(__dirname, './pkg/atomic-nft-contract_bg.wasm');

module.exports.wasmSrcCodeDir = path.join(__dirname, './src');

module.exports.wasmGlueCode = path.join(__dirname, './pkg/atomic-nft-contract.js');
