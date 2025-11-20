// src/api/models/mongodb/dailypnl.js

// Importa librería
const mongoose = require('mongoose');

// Declara esquema
const DailyPnlSchema = new mongoose.Schema(
  {
    // Cuenta o portafolio
    account: {
      type: String,
      required: true,
      trim: true,
    },

    // Fecha contable (solo fecha)
    date: {
      type: Date,
      required: true,
    },

    // PnL realizado del día
    realized: {
      type: Number,
      default: 0,
    },

    // PnL no realizado (mark-to-market)
    unrealized: {
      type: Number,
      default: 0,
    },

    // 👉 Borrado lógico / estado del registro
    active: {
      type: Boolean,
      default: true,
    },

    // Auditoría básica
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
    },
  },
  {
    collection: 'Datos', // colección que ya tienes en DailyPnls
    versionKey: false,
  }
);

// Índice único por (account, date)
DailyPnlSchema.index({ account: 1, date: 1 }, { unique: true });

// Middleware: actualizar updatedAt en save
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
