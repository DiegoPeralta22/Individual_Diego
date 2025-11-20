// src/api/services/dailypnl-service.js

// ======================= MODELO MONGO =======================
const DailyPnl = require('../models/mongodb/dailypnl');

// ======================= BITÁCORA / RESPUESTAS =======================
const {
  BITACORA,
  DATA,
  AddMSG,
  OK,
  FAIL,
} = require('../../middlewares/respPWA.handler');

// ======================= HELPERS GENERALES =======================

/**
 * Construye filtro para Mongo desde query
 * Soporta:
 *  - account
 *  - date
 *  - from (fecha inicio)
 *  - to (fecha fin)
 *  - active (true/false) opcional
 */
function buildFilter(q = {}) {
  const f = {};

  if (q.account) {
    f.account = String(q.account);
  }

  // Filtro por fecha exacta
  if (q.date) {
    f.date = new Date(q.date);
  }

  // Rango de fechas
  if (q.from || q.to) {
    f.date = {};
    if (q.from) f.date.$gte = new Date(q.from);
    if (q.to) f.date.$lte = new Date(q.to);
  }

  // Filtro por activo (opcional)
  if (q.active !== undefined) {
    if (String(q.active).toLowerCase() === 'true') f.active = true;
    if (String(q.active).toLowerCase() === 'false') f.active = false;
  }

  return f;
}

// Helpers de fecha/hora
const today = () => new Date().toISOString().slice(0, 10);

// ============================================================
//                    Dispatcher (acción CRUD)
// ============================================================

/**
 * Endpoint acción:
 *   POST /api/dailypnls/crud?ProcessType=...&DBServer=mongodb
 *
 * Query:
 *   ProcessType, DBServer, LoggedUser, account, date, from, to...
 *
 * Body:
 *   { data: { ... } }  ó  { data: [ {...}, {...} ] }
 */
async function crudDailypnl(req) {
  let bitacora = BITACORA();
  let data = DATA();

  const query = req.query || {};
  const body = req.body || {};

  const ProcessType = String(query.ProcessType || '').trim();
  const DBServer = String(query.DBServer || 'mongodb').trim();
  const LoggedUser = String(query.LoggedUser || 'SYSTEM').trim();

  const PT = ProcessType.toLowerCase();
  const db = DBServer.toLowerCase();

  bitacora.loggedUser = LoggedUser;
  bitacora.processType = ProcessType;
  bitacora.dbServer = DBServer;
  bitacora.process = 'DailyPnls';

  const params = { query, body };

  try {
    switch (PT) {
      // ===================== GETs =====================
      case 'getall':
      case 'getsome':
      case 'getbyid': {
        bitacora = await GetDailyPnlMethod(bitacora, params, db, PT);
        break;
      }

      // ===================== CREATE =====================
      case 'create':
      case 'addone':
      case 'addmany': {
        bitacora = await AddManyDailyPnlMethod(bitacora, params, db);
        break;
      }

      // ===================== UPDATE =====================
      case 'update':
      case 'updateone': {
        bitacora = await UpdateOneDailyPnlMethod(bitacora, params, db);
        break;
      }

      // 👉 ACTIVO / INACTIVO (borrado lógico)
      case 'updateactive': {
        bitacora = await UpdateActiveDailyPnlMethod(bitacora, params, db);
        break;
      }

      // ===================== DELETE =====================
      case 'delete':
      case 'deleteone': {
        bitacora = await DeleteOneDailyPnlMethod(bitacora, params, db);
        break;
      }

      case 'deletehard': {
        bitacora = await DeleteHardDailyPnlMethod(bitacora, params, db);
        break;
      }

      // ===================== DEFAULT =====================
      default: {
        data.status = 400;
        data.messageUSR = 'Tipo de proceso inválido';
        data.messageDEV = `Proceso no reconocido: ${ProcessType}`;
        bitacora = AddMSG(bitacora, data, 'FAIL', 400, true);
        return FAIL(bitacora);
      }
    }

    return bitacora.success ? OK(bitacora) : FAIL(bitacora);
  } catch (error) {
    data.status = data.status || 500;
    data.messageDEV = data.messageDEV || error.message;
    data.messageUSR =
      data.messageUSR || '<<ERROR CATCH>> El proceso no se completó';
    data.dataRes = data.dataRes || error;
    bitacora = AddMSG(bitacora, data, 'FAIL');
    return FAIL(bitacora);
  }
}

// ============================================================
//                    MÉTODOS LOCALES
// ============================================================

// ========== GET (GetAll / GetSome / GetById) ==========
async function GetDailyPnlMethod(bitacora, options = {}, db, PT) {
  const { query } = options;
  const data = DATA();

  data.process = 'Lectura de DailyPnls';
  data.processType = bitacora.processType;
  data.method = 'POST';
  data.api = `/crud?ProcessType=${bitacora.processType}`;

  try {
    if (db !== 'mongodb') {
      data.status = 400;
      data.messageUSR = 'DB no soportada (solo mongodb por ahora)';
      data.messageDEV = `DBServer no soportado: ${db}`;
      bitacora = AddMSG(bitacora, data, 'FAIL', 400, true);
      return bitacora;
    }

    let result;

    if (PT === 'getall') {
      const filter = buildFilter(query);
      result = await DailyPnl.find(filter).lean();
    } else if (PT === 'getsome') {
      const filter = buildFilter(query);
      result = await DailyPnl.find(filter).lean();
    } else if (PT === 'getbyid') {
      if (!query.account || !query.date) {
        data.status = 400;
        data.messageUSR = 'Faltan parámetros account y/o date';
        data.messageDEV = 'GetById requiere account y date';
        bitacora = AddMSG(bitacora, data, 'FAIL', 400, true);
        return bitacora;
      }
      result = await DailyPnl.findOne({
        account: String(query.account),
        date: new Date(query.date),
      }).lean();
    }

    data.status = 200;
    data.messageUSR = '<<OK>> La extracción <<SI>> tuvo éxito.';
    data.dataRes = result || (PT === 'getbyid' ? null : []);
    bitacora = AddMSG(bitacora, data, 'OK', 200, true);
    return bitacora;
  } catch (error) {
    data.status = 500;
    data.messageDEV = error.message;
    data.messageUSR = '<<ERROR>> La extracción <<NO>> tuvo éxito.';
    data.dataRes = error;
    bitacora = AddMSG(bitacora, data, 'FAIL');
    return bitacora;
  }
}

// ========== CREATE (uno o varios) ==========
async function AddManyDailyPnlMethod(bitacora, options = {}, db) {
  const { body } = options;
  const data = DATA();

  data.process = 'Alta de DailyPnls';
  data.processType = bitacora.processType;
  data.method = 'POST';
  data.api = '/crud?ProcessType=Create';

  try {
    if (db !== 'mongodb') {
      data.status = 400;
      data.messageUSR = 'DB no soportada (solo mongodb por ahora)';
      data.messageDEV = `DBServer no soportado: ${db}`;
      bitacora = AddMSG(bitacora, data, 'FAIL', 400, true);
      return bitacora;
    }

    let payload = body?.data || body?.pnl || body || null;

    if (!payload) {
      data.status = 400;
      data.messageUSR = 'Falta body.data';
      data.messageDEV = 'El payload debe venir en body.data';
      bitacora = AddMSG(bitacora, data, 'FAIL', 400, true);
      return bitacora;
    }

    const arr = Array.isArray(payload) ? payload : [payload];

    const docs = arr.map((d) => ({
      account: String(d.account),
      date: new Date(d.date || today()),
      realized: Number(d.realized ?? 0),
      unrealized: Number(d.unrealized ?? 0),
      active: d.active === false ? false : true,
      createdAt: d.createdAt ? new Date(d.createdAt) : new Date(),
      updatedAt: d.updatedAt ? new Date(d.updatedAt) : new Date(),
    }));

    const inserted = await DailyPnl.insertMany(docs, { ordered: true });

    data.status = 201;
    data.messageUSR = '<<OK>> Alta realizada.';
    data.dataRes = JSON.parse(JSON.stringify(inserted));
    bitacora = AddMSG(bitacora, data, 'OK', 201, true);
    return bitacora;
  } catch (error) {
    data.status = 500;
    data.messageDEV = error.message;
    data.messageUSR = '<<ERROR>> Alta <<NO>> exitosa.';
    data.dataRes = error;
    bitacora = AddMSG(bitacora, data, 'FAIL');
    return bitacora;
  }
}

// ========== UPDATE (uno, por account + date) ==========
async function UpdateOneDailyPnlMethod(bitacora, options = {}, db) {
  const { body } = options;
  const data = DATA();

  data.process = 'Actualización de DailyPnl';
  data.processType = bitacora.processType;
  data.method = 'POST';
  data.api = '/crud?ProcessType=UpdateOne';

  try {
    if (db !== 'mongodb') {
      data.status = 400;
      data.messageUSR = 'DB no soportada (solo mongodb por ahora)';
      data.messageDEV = `DBServer no soportado: ${db}`;
      bitacora = AddMSG(bitacora, data, 'FAIL', 400, true);
      return bitacora;
    }

    const payload = body?.data || body || null;

    if (!payload) {
      data.status = 400;
      data.messageUSR = 'Falta body.data con los campos';
      data.messageDEV = 'UpdateOne requiere body.data';
      bitacora = AddMSG(bitacora, data, 'FAIL', 400, true);
      return bitacora;
    }

    if (!payload.account || !payload.date) {
      data.status = 400;
      data.messageUSR = 'Faltan campos de llave (account, date) en body.data';
      data.messageDEV =
        'Se requiere account y date para actualizar un DailyPnl';
      bitacora = AddMSG(bitacora, data, 'FAIL', 400, true);
      return bitacora;
    }

    const filter = {
      account: String(payload.account),
      date: new Date(payload.date),
    };

    const changes = {};
    if (payload.realized !== undefined)
      changes.realized = Number(payload.realized);
    if (payload.unrealized !== undefined)
      changes.unrealized = Number(payload.unrealized);
    if (payload.active !== undefined)
      changes.active = payload.active === true;

    const updated = await DailyPnl.findOneAndUpdate(
      filter,
      { $set: changes },
      { new: true, upsert: false }
    ).lean();

    if (!updated) {
      data.status = 404;
      data.messageUSR = 'No se encontró registro a actualizar';
      data.messageDEV = 'findOneAndUpdate retornó null';
      bitacora = AddMSG(bitacora, data, 'FAIL', 404, true);
      return bitacora;
    }

    data.status = 201;
    data.messageUSR = '<<OK>> Actualización realizada.';
    data.dataRes = updated;
    bitacora = AddMSG(bitacora, data, 'OK', 201, true);
    return bitacora;
  } catch (error) {
    data.status = 500;
    data.messageDEV = error.message;
    data.messageUSR = '<<ERROR>> Actualización <<NO>> exitosa.';
    data.dataRes = error;
    bitacora = AddMSG(bitacora, data, 'FAIL');
    return bitacora;
  }
}

// ========== UPDATEACTIVE (borrado lógico / activar-desactivar) ==========
async function UpdateActiveDailyPnlMethod(bitacora, options = {}, db) {
  const { body } = options;
  const data = DATA();

  data.process = 'Cambio Activo/Inactivo';
  data.processType = bitacora.processType;
  data.method = 'POST';
  data.api = '/crud?ProcessType=UpdateActive';

  try {
    if (db !== 'mongodb') {
      data.status = 400;
      data.messageUSR = 'DB no soportada (solo mongodb por ahora)';
      data.messageDEV = `DBServer no soportado: ${db}`;
      bitacora = AddMSG(bitacora, data, 'FAIL', 400, true);
      return bitacora;
    }

    const payload = body?.data || body || null;

    if (!payload) {
      data.status = 400;
      data.messageUSR = 'Falta body.data con los campos';
      data.messageDEV = 'UpdateActive requiere body.data';
      bitacora = AddMSG(bitacora, data, 'FAIL', 400, true);
      return bitacora;
    }

    if (!payload.account || !payload.date) {
      data.status = 400;
      data.messageUSR = 'Faltan account y date';
      data.messageDEV = 'Se requiere (account, date)';
      bitacora = AddMSG(bitacora, data, 'FAIL', 400, true);
      return bitacora;
    }

    const filter = {
      account: String(payload.account),
      date: new Date(payload.date),
    };

    const updated = await DailyPnl.findOneAndUpdate(
      filter,
      { $set: { active: payload.active === true } },
      { new: true }
    ).lean();

    if (!updated) {
      data.status = 404;
      data.messageUSR = 'No se encontró registro';
      data.messageDEV = 'UpdateActive retornó null';
      bitacora = AddMSG(bitacora, data, 'FAIL', 404, true);
      return bitacora;
    }

    data.status = 200;
    data.messageUSR = '<<OK>> Estado actualizado.';
    data.dataRes = updated;
    bitacora = AddMSG(bitacora, data, 'OK', 200, true);
    return bitacora;
  } catch (error) {
    data.status = 500;
    data.messageUSR = '<<ERROR>> No se pudo cambiar el estado';
    data.messageDEV = error.message;
    data.dataRes = error;
    bitacora = AddMSG(bitacora, data, 'FAIL');
    return bitacora;
  }
}

// ========== DELETE (físico simple) ==========
async function DeleteOneDailyPnlMethod(bitacora, options = {}, db) {
  const { body } = options;
  const data = DATA();

  data.process = 'Borrado de DailyPnl';
  data.processType = bitacora.processType;
  data.method = 'POST';
  data.api = '/crud?ProcessType=DeleteOne';

  try {
    if (db !== 'mongodb') {
      data.status = 400;
      data.messageUSR = 'DB no soportada (solo mongodb por ahora)';
      data.messageDEV = `DBServer no soportado: ${db}`;
      bitacora = AddMSG(bitacora, data, 'FAIL', 400, true);
      return bitacora;
    }

    const payload = body?.data || body || null;

    if (!payload) {
      data.status = 400;
      data.messageUSR = 'Falta body.data con los campos';
      data.messageDEV = 'DeleteOne requiere body.data';
      bitacora = AddMSG(bitacora, data, 'FAIL', 400, true);
      return bitacora;
    }

    if (!payload.account || !payload.date) {
      data.status = 400;
      data.messageUSR = 'Faltan campos de llave (account, date) en body.data';
      data.messageDEV =
        'Se requiere account y date para borrar un DailyPnl';
      bitacora = AddMSG(bitacora, data, 'FAIL', 400, true);
      return bitacora;
    }

    const filter = {
      account: String(payload.account),
      date: new Date(payload.date),
    };

    const deleted = await DailyPnl.findOneAndDelete(filter).lean();

    if (!deleted) {
      data.status = 404;
      data.messageUSR = 'No se encontró registro a eliminar';
      data.messageDEV = 'findOneAndDelete retornó null';
      bitacora = AddMSG(bitacora, data, 'FAIL', 404, true);
      return bitacora;
    }

    data.status = 201;
    data.messageUSR = '<<OK>> Borrado físico realizado.';
    data.dataRes = { message: 'Eliminado', filtro: filter };
    bitacora = AddMSG(bitacora, data, 'OK', 201, true);
    return bitacora;
  } catch (error) {
    data.status = 500;
    data.messageDEV = error.message;
    data.messageUSR = '<<ERROR>> Borrado físico <<NO>> exitoso.';
    data.dataRes = error;
    bitacora = AddMSG(bitacora, data, 'FAIL');
    return bitacora;
  }
}

// ========== DELETE HARD (por ahora igual que DeleteOne) ==========
async function DeleteHardDailyPnlMethod(bitacora, options = {}, db) {
  return await DeleteOneDailyPnlMethod(bitacora, options, db);
}

// ============================================================
//                    EXPORTS
// ============================================================
module.exports = {
  crudDailypnl,
  UpdateActiveDailyPnlMethod,
};

