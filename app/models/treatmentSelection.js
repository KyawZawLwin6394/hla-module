'use strict';

const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const Schema = mongoose.Schema;


let TreatmentSelectionSchema = new Schema({
  code: {
    type: String
  },
  paymentMethod: {
    type: String,
    enum: ['Credit', 'Cash Down', 'FOC', 'Advance']
  },
  paidAmount: {
    type: Number,
  },
  leftOverAmount: {
    type: Number,
  },
  totalAmount: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    required: true,
    default: false
  },
  relatedTreatment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Treatments'
  },
  relatedTreatmentList: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TreatmentLists'
  },
  relatedAppointments: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Appointments',
  },
  selectionStatus: {
    type: String,
    enum: ['Ongoing', 'Done']
  },
  relatedPatient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patients'
  },
  finishedAppointments: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Appointments',
  },
  remainingAppointments: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Appointments',
  },
  relatedTransaction: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Transactions'
  },
  inBetweenDuration: {
    type: Number
  },
  bodyParts: {
    type: String,
    enum: ['Treatment', 'Injection', 'Hair,Combine Tre & Facial', 'Surgery Price List', 'Combination Package']
  },
  treatmentTimes: {
    type: Number
  },
  seq: {
    type: Number
  },
  relatedTreatmentVoucher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TreatmentVouchers'
  },
  relatedBranch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branches'
  },
  paymentStatus: {
    type: Boolean
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users'
  },
  saleReturnFlag: {
    type: Boolean,
    default: false
  },
  purchaseType: {
    type: String,
    enum: ['Clinic', 'Surgery']
  },
  remark: {
    type: String
  },
  deposit: {
    type: Number
  },
  purchaseTotal:{
    type:Number
  }

});
const patient = mongoose.model('TreatmentSelections', TreatmentSelectionSchema)
module.exports = patient;

//Author: Kyaw Zaw Lwin
