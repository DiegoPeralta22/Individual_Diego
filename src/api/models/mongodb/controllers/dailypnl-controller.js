// src/api/controllers/dailypnl-controller.js
const cds = require('@sap/cds');
const { crudDailyPnl } = require('../services/dailypnl-service'); 
// OJO: ajusta el nombre de archivo si lo llamaste 'daylypnl-service.js'

class DailyPnlController extends cds.ApplicationService {
  async init () {
    // Un solo handler para la acción 'crud' definida en el .cds
    this.on('crud', req => crudDailyPnl(req));
    return super.init();
  }
}

module.exports = DailyPnlController;
