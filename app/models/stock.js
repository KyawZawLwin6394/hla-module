'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let StockSchema = new Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  relatedProcedureItems: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProcedureItems'
  },
  relatedMedicineItems: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicineItems'
  },
  relatedAccessoryItems: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AccessoryItems'
  },
  relatedMachine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FixedAssets'
  },
  sellingPrice: {
    type: Number
  },
  purchasePrice: {
    type: Number
  },
  qty: {
    type: Number
  },
  seq: {
    type: Number
  },
  expiredDate: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    required: true,
    default: false
  },
});

module.exports = mongoose.model('Stocks', StockSchema);

//Author: Kyaw Zaw Lwin
