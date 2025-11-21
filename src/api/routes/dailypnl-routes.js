// src/api/routes/dailypnl-routes.js
const express = require('express');
const router = express.Router();
//delegar a crudDailypnl
const { crudDailypnl  } = require('../services/daylypnl-service');

router.post('/crud', async (req, res) => {
  try {
    const result = await crudDailypnl (req);
    res.status(result.status || 200).json(result);
  } catch (err) {
    console.error('Error en /api/dailypnls/crud:', err);
    res.status(err.status || 500).json(err);
  }
});

module.exports = router;
