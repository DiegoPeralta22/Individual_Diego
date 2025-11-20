// src/middlewares/respPWA.handler.js
const { whatTypeVarIs } = require('../helpers/variables');

const BITACORA = () => {
  const bitacora = {
    success      : false,
    status       : 0,
    process      : '',
    processType  : '',
    messageUSR   : '',
    messageDEV   : '',
    countData    : 0,
    countDataReq : 0,
    countDataRes : 0,
    countMsgUSR  : 0,
    countMsgDEV  : 0,
    dbServer     : '',
    server       : '',
    data         : [],
    loggedUser   : '',
    finalRes     : false
  };
  return bitacora;
};

const DATA = () => {
  const data = {
    success      : false,
    status       : 0,
    process      : '',
    processType  : '',
    principal    : false,
    secuencia    : 0,
    countDataReq : 0,
    countDataRes : 0,
    countFile    : 0,
    messageUSR   : '',
    messageDEV   : '',
    method       : '',
    api          : '',
    dataReq      : [],
    dataRes      : [],
    file         : []
  };
  return data;
};

const AddMSG = (bitacora, data, tipo, status = 500, principal = false) => {
  const isOK = (tipo === 'OK');
  data.success     = (typeof data.success === 'boolean') ? data.success : isOK;
  bitacora.success = data.success;

  data.status      = data.status      || status;
  data.process     = data.process     || 'No Especificado';
  data.processType = data.processType || 'No Especificado';
  data.principal   = (data.principal === true);
  data.method      = data.method      || 'No Especificado';
  data.api         = data.api         || 'No Especificado';
  data.secuencia   = (data.secuencia || 0) + 1;

  bitacora.process     = data.process;
  bitacora.processType = data.processType;

  if (data.messageDEV) { bitacora.messageDEV = data.messageDEV; bitacora.countMsgDEV++; }
  if (data.messageUSR) { bitacora.messageUSR = data.messageUSR; bitacora.countMsgUSR++; }

  if (data.dataReq) {
    if (whatTypeVarIs(data.dataReq) === 'isArray')        data.countDataReq = data.dataReq.length;
    else if (whatTypeVarIs(data.dataReq) === 'isObject')  data.countDataReq = 1;
    else data.countDataReq = 0;
    bitacora.countDataReq++;
  }

  if (data.dataRes) {
    if (whatTypeVarIs(data.dataRes) === 'isArray')        data.countDataRes = data.dataRes.length;
    else if (whatTypeVarIs(data.dataRes) === 'isObject')  data.countDataRes = 1;
    else data.countDataRes = 0;
    bitacora.countDataRes++;
  }

  if (data.file) {
    if (whatTypeVarIs(data.file) === 'isArray')        data.countFile = data.file.length;
    else if (whatTypeVarIs(data.file) === 'isObject')  data.countFile = 1;
    else data.countFile = 0;
  }

  bitacora.status = data.status;
  bitacora.data.push(data);
  bitacora.countData++;

  return bitacora;
};

const OK = (bitacora) => {
  if (!bitacora.dbServer)
    bitacora.dbServer = process.env.CONNECTION_TO_HANA;

  return {
    success      : bitacora.success      || true,
    status       : bitacora.status       || 500,
    process      : bitacora.process      || 'No Especificado',
    processType  : bitacora.processType  || 'No Especificado',
    messageUSR   : bitacora.messageUSR   || 'No Especificado',
    messageDEV   : bitacora.messageDEV   || 'No Especificado',
    countData    : bitacora.countData    || 0,
    countDataReq : bitacora.countDataReq || 0,
    countDataRes : bitacora.countDataRes || 0,
    countMsgUSR  : bitacora.countMsgUSR  || 0,
    countMsgDEV  : bitacora.countMsgDEV  || 0,
    dbServer     : bitacora.dbServer     || 'Default',
    server       : bitacora.server       || 'Default',
    data         : bitacora.data         || [],
    session      : bitacora.session      || 'No Especificado',
    loggedUser   : bitacora.loggedUser   || 'No Especificado',
    finalRes     : bitacora.finalRes     || false
  }
};

const FAIL = (bitacora) => {
  if (!bitacora.dbServer)
    bitacora.dbServer = process.env.CONNECTION_TO_HANA;

  return {
    success      : bitacora.success      || false,
    status       : bitacora.status       || 500,
    process      : bitacora.process      || 'No Especificado',
    processType  : bitacora.processType  || 'No Especificado',
    messageUSR   : bitacora.messageUSR   || 'No Especificado',
    messageDEV   : bitacora.messageDEV   || 'No Especificado',
    countData    : bitacora.countData    || 0,
    countDataReq : bitacora.countDataReq || 0,
    countDataRes : bitacora.countDataRes || 0,
    countMsgUSR  : bitacora.countMsgUSR  || 0,
    countMsgDEV  : bitacora.countMsgDEV  || 0,
    dbServer     : bitacora.dbServer     || 'Default',
    server       : bitacora.server       || 'Default',
    data         : bitacora.data         || [],
    session      : bitacora.session      || 'No Especificado',
    loggedUser   : bitacora.loggedUser   || 'No Especificado',
    finalRes     : bitacora.finalRes     || false
  }
};

module.exports = {
  BITACORA,
  DATA,
  AddMSG,
  OK,
  FAIL
};
