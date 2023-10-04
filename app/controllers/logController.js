'use strict';
const Log = require('../models/log');
const ProcedureItem = require('../models/procedureItem');
const AccessoryItem = require('../models/accessoryItem');
const Machine = require('../models/fixedAsset');
const Usage = require('../models/usage');
const UsageRecords = require('../models/usageRecord');
const stock = require('../models/stock');
const Appointment = require('../models/appointment');

exports.listAllLog = async (req, res) => {
  try {
    let result = await Log.find({ isDeleted: false }).populate('relatedTreatmentSelection relatedAppointment relatedProcedureItems relatedAccessoryItems relatedMachine relatedMedicineItems').populate({
      path: 'relatedTreatmentSelection',
      populate: [{
        path: 'relatedTreatment',
        model: 'Treatments'
      }]
    });
    let count = await Log.find({ isDeleted: false }).count();
    if (result.length === 0) return res.status(404).send({ error: true, message: 'No Record Found!' });
    res.status(200).send({
      success: true,
      count: count,
      data: result
    });
  } catch (error) {
    return res.status(500).send({ error: true, message: 'No Record Found!' });
  }
};

exports.getRelatedUsage = async (req, res) => {
  try {
    let result = await Log.find({ isDeleted: false }).populate('relatedTreatmentSelection relatedAppointment');
    let count = await Log.find({ isDeleted: false }).count();
    if (result.length === 0) return res.status(404).send({ error: true, message: 'No Record Found!' });
    res.status(200).send({
      success: true,
      count: count,
      data: result
    });
  } catch (error) {
    return res.status(500).send({ error: true, message: 'No Record Found!' });
  }
};

exports.filterLogs = async (req, res, next) => {
  try {
    let query = { isDeleted: false }
    const { start, end, id } = req.query
    console.log(start, end)
    if (start && end) query.date = { $gte: start, $lte: end }
    if (id) {
      query.$or = []
      query.$or.push(...[{ relatedProcedureItems: id }, { relatedAccessoryItems: id }, { relatedMachine: id }])
    }
    console.log(query)
    if (Object.keys(query).length === 0) return res.status(404).send({ error: true, message: 'Please Specify A Query To Use This Function' })
    const result = await Log.find(query).populate('relatedProcedureItems relatedAccessoryItems relatedMachine relatedMedicineItems relatedBranch');
    if (result.length === 0) return res.status(404).send({ error: true, message: "No Record Found!" })
    res.status(200).send({ success: true, data: result })
  } catch (err) {
    return res.status(500).send({ error: true, message: err.message })
  }
}

exports.createUsage = async (req, res) => {
  let { relatedTreatmentSelection, relatedAppointment, procedureMedicine, procedureAccessory, machine } = req.body;
  let machineError = []
  let procedureItemsError = []
  let accessoryItemsError = []
  let machineFinished = []
  let procedureItemsFinished = []
  let accessoryItemsFinished = []
  let createdBy = req.credentials.id
  try {
    const appResult = await Appointment.find({ _id: req.body.relatedAppointment })
    let status;
    if (appResult[0].relatedUsage === undefined) {

      if (procedureMedicine !== undefined) {
        for (const item of procedureMedicine) {
          const actualQty = item.actual
          let { item_id, actual } = item;
          const findResult = await stock.find({ relatedProcedureItems: item_id, isDeleted: false }).sort({ seq: -1 });
          const find = await stock.find({ relatedProcedureItems: item_id, isDeleted: false })
          console.log(find)
          const totalQty = find.reduce((accumulator, value) => accumulator + (value.qty || 0), 0);
          console.log(totalQty)
          if (actual >= totalQty) {
            return res.status(404).send({ error: true, message: 'Not Enough Qty', procedureItem: item_id });
          } else {
            for (const i of findResult) {
              if (i.qty <= actual) {
                await stock.findOneAndUpdate({ _id: i._id }, { $set: { isDeleted: true } });
                actual -= i.qty;
              } else {
                await stock.findOneAndUpdate({ _id: i._id }, { $inc: { qty: -actual } });
                actual = 0;
              }
            }
            //update master item's qty 
            const procedureUpdate = await ProcedureItem.findOneAndUpdate({ _id: item_id }, { $inc: { currentQuantity: -actualQty } }, { new: true })
            console.log(procedureUpdate, 'here', actual)
            const logCreate = await Log.create({
              type: 'Usage',
              relatedProcedureItems: item_id,
              currentQty: totalQty,
              actualQty: actualQty,
              finalQty: totalQty - actualQty,
              date: Date.now()
            })
          }
        }
      }

      if (procedureAccessory !== undefined) {
        for (const item of procedureAccessory) {
          const actualQty = item.actual
          let { item_id, actual } = item;
          const findResult = await stock.find({ relatedAccessoryItems: item_id, isDeleted: false }).sort({ seq: -1 });
          const find = await stock.find({ relatedAccessoryItems: item_id, isDeleted: false })
          console.log(find)
          const totalQty = find.reduce((accumulator, value) => accumulator + (value.qty || 0), 0);
          console.log(totalQty)
          if (actual >= totalQty) {
            return res.status(404).send({ error: true, message: 'Not Enough Qty', procedureItem: item_id });
          } else {
            for (const i of findResult) {
              if (i.qty <= actual) {
                await stock.findOneAndUpdate({ _id: i._id }, { $set: { isDeleted: true } });
                actual -= i.qty;
              } else {
                await stock.findOneAndUpdate({ _id: i._id }, { $inc: { qty: -actual } });
                actual = 0;
              }
            }
            const accessoryItemUpdate = await AccessoryItem.findOneAndUpdate({ _id: item_id }, { $inc: { currentQuantity: -actualQty } }, { new: true })
            const logCreate = await Log.create({
              type: 'Usage',
              relatedAccessoryItems: item_id,
              currentQty: totalQty,
              actualQty: actualQty,
              finalQty: totalQty - actualQty,
              date: Date.now()
            })
          }
        }
      }

      req.body = { ...req.body, machineError: machineError, usageStatus: status, procedureItemsError: procedureItemsError, accessoryItemsError: accessoryItemsError, procedureAccessory: accessoryItemsFinished, procedureMedicine: procedureItemsFinished, machine: machineFinished }
      var usageResult = await Usage.create(req.body);
      var appointmentUpdate = await Appointment.findOneAndUpdate(
        { _id: req.body.relatedAppointment },
        { usageStatus: status, relatedUsage: usageResult._id },
        { new: true }
      )
      var usageRecordResult = await UsageRecords.create({
        relatedUsage: usageResult._id,
        usageStatus: status,
        procedureMedicine: procedureItemsFinished,
        procedureAccessory: accessoryItemsFinished,
        machine: machineFinished,
        machineError: machineError,
        procedureItemsError: procedureItemsError,
        accessoryItemsError: accessoryItemsError
      })
    }
    else {
      return res.status(200).send({ error: true, message: 'Already Used' })
    }

    let response = { success: true }
    if (usageResult !== undefined) response.usageResult = usageResult
    if (usageRecordResult !== undefined) response.usageRecordResult = usageRecordResult

    return res.status(200).send(response)
  } catch (error) {
    console.log(error)
    return res.status(500).send({ error: true, message: error.message })
  }
}

exports.showUsageQty = async (req, res) => {
  try {
    let response = { success: true }
    if (req.body.relatedAccessoryItems) {
      const getAccessoryItems = await AccessoryItem.find({ _id: { $in: req.body.relatedAccessoryItems } }).select('_id currentQuantity')
      response.relatedAccessoryItems = getAccessoryItems
    }
    if (req.body.relatedProcedureItems) {
      const getProcedureItems = await ProcedureItem.find({ _id: { $in: req.body.relatedProcedureItems } }).select('_id currentQuantity')
      response.relatedProcedureItems = getProcedureItems
    }
    return res.status(200).send(response)
  } catch (error) {
    return res.status(500).send({ error: true, message: error.message })
  }
}