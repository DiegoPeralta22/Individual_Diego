// src/helpers/variables.js

// ¿Qué tipo de variable es?
function whatTypeVarIs(variable) { 
  if (Array.isArray(variable)) {
    return "isArray";
  } else if (typeof variable === 'object' && variable !== null) {
    return "isObject";
  } else {
    return null;
  }
};

module.exports = { whatTypeVarIs };
