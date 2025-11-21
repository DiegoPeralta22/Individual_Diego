// src/api/models/mongodb/dailypnl.js

// Importa librería
const mongoose = require('mongoose');

// Declara esquema
const DailyPnlSchema = new mongoose.Schema(
  {
    // Cuenta 
    account: {
      type: String,
      required: true,
      trim: true,
    },

    //solo fecha
    date: {
      type: Date,
      required: true,
    },

    //   del día
    realized: {
      type: Number,
      default: 0,
    },

    //  no realizado 
    unrealized: {
      type: Number,
      default: 0,
    },

    //  Borrado lógico
    active: {
      type: Boolean,
      default: true,
    },

    // es pal llenado automatico al crear siuu
    createdAt: {
      type: Date,
      default: Date.now,
    },
    //ojo animal recuerda lo hace el middleware 
    updatedAt: {
      type: Date,
    },
  },
  {
    //colección que ya se creo siuu
    collection: 'Datos', 
    //algo de mongo pa las colecciones internas 
    versionKey: false,
  }
);

// Índice único account y date
DailyPnlSchema.index({ account: 1, date: 1 }, { unique: true });

// aactualizar automaticamente el update
DailyPnlSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Middleware: actualizar updatedAt en findOneAndUpdate
DailyPnlSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

module.exports =
  mongoose.models.DailyPnl || mongoose.model('DailyPnl', DailyPnlSchema);
