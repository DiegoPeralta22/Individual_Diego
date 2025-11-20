// src/config/dotenvConfig.js
const dotenvx = require('@dotenvx/dotenvx');
dotenvx.config();

console.log('✅ Variables de entorno cargadas (.env)');
module.exports = {};
