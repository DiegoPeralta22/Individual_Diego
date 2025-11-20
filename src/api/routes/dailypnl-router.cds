// src/api/routes/dailypnl-router.cds

using Daily as mydaily from '../models/dailypnl';  // <- modelo CDS (lo hacemos después si no lo tienes)

// Vincula este router con el controller JS
@impl: 'src/api/controllers/dailypnl-controller.js'
service DailyPnlRoute @(path: '/api/dailypnl') {

  // Proyección de la entidad (para que CAP conozca el tipo)
  @cds.autoexpose
  entity DailyPnl as projection on mydaily.DailyPnl;

  // Dispatcher único tipo “gruposet”: todo se va a una sola acción
  @path: 'crud'
  action crud(
    ProcessType : String,   // 'GetAll', 'GetById', 'Create', 'UpdateOne', 'DeleteOne', etc.
    account     : String,
    from        : Date,     // rango de fechas (desde)
    to          : Date,     // rango de fechas (hasta)
    date        : Date,     // fecha específica
    data        : Map       // payload flexible (para create/update)
  ) returns array of DailyPnl;
}
