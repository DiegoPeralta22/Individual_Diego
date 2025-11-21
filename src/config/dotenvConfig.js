// src/config/dotenvConfig.js
const dotenvx = require('@dotenvx/dotenvx');
//lee los archivos .env y lo pone en el porcess.env
dotenvx.config();

console.log('✅ Variables de entorno cargadas (.env)');
 //exporta algo pa poder utilizar las variables process.env tontito
module.exports = {};
