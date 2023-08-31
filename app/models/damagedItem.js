'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;

let DamagedItemSchema = new Schema({
    isDeleted: {
        type: Boolean,
        required: true,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    damagedDate: {
        type: Date
    },
    relatedStockRecord: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stocks'
    },
    damagedTotalUnit: {
        type: Number
    },
    damagedCurrentQty: {
        type: Number
    },
    reason: {
        type: String
    }
});

module.exports = mongoose.model('DamagedItems', DamagedItemSchema);

//Author: Kyaw Zaw Lwin
