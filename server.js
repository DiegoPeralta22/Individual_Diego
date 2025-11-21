const express = require('express');
const cors = require('cors');

require('./src/config/dotenvConfig');
const connectToMongo = require('./src/config/connectToMongo');

// Model DailyPnl
require('./src/api/models/mongodb/dailypnl.js');

// Router enterprise
const dailypnlRouter = require('./src/api/routes/dailypnl-routes');

async function startServer() {
  await connectToMongo();

  const app = express();
  app.use(express.json());
  //cors pal fronted
  app.use(cors());
//para ver si laAPI EN GENERAL SIRVE 
  app.get('/api/health', (req, res) => {
    res.json({
      ok: true,
      message: 'API DailyPnls funcionando correctamente',
      database: process.env.MONGO_DB,
    });
  });

  // HACE Que todo lo que use esto y con el /algo jale
  app.use('/api/dailypnls', dailypnlRouter);


  //arranque del servidor 
  const PORT = process.env.PORT || 3333;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor DailyPnls corriendo en http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('❌ Error al iniciar el servidor:', err.message);
});
