// src/config/connectToMongo.js
const mongoose = require('mongoose');
require('./dotenvConfig');

async function connectToMongo() {
  try {
    console.log('🔌 Conectando a MongoDB Atlas...');

    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.MONGO_DB,
    });

    console.log('✅ Conectado a MongoDB Atlas');
    console.log('   Base de datos:', process.env.MONGO_DB);

  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error.message);
    process.exit(1);
  }
}

module.exports = connectToMongo;
