// src/config/connectToMongo.js
//importaciones
const mongoose = require('mongoose');
require('./dotenvConfig');

//creo la funcion siuuu
async function connectToMongo() {
  try {
    console.log('🔌 Conectando a MongoDB Atlas...');
//estoy conectandome a pongo db 
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
