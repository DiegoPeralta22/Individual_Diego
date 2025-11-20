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
  app.use(cors());

  app.get('/api/health', (req, res) => {
    res.json({
      ok: true,
      message: 'API DailyPnls funcionando correctamente',
      database: process.env.MONGO_DB,
    });
  });

  // 👉 Aquí el endpoint enterprise
  app.use('/api/dailypnls', dailypnlRouter);

  const PORT = process.env.PORT || 3333;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor DailyPnls corriendo en http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('❌ Error al iniciar el servidor:', err.message);
});
