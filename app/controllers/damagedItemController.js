'use strict';
const DamagedItem = require('../models/damagedItem');
const Stock = require('../models/stock');
const ProcedureItems = require('../models/procedureItem');
const AccessoryItems = require('../models/accessoryItem');
const MedicineItems = require('../models/medicineItem');
exports.listAllDamagedItems = async (req, res) => {
  try {
    let result = await DamagedItem.find({ isDeleted: false }).populate({
      path: 'relatedStockRecord',
      model: 'Stocks',
      populate: {
        path: 'relatedMedicineItems',
        model: 'MedicineItems'
      }
    });
    let count = await DamagedItem.find({ isDeleted: false }).count();
    res.status(200).send({
      success: true,
      count: count,
      data: result
    });
  } catch (error) {
    return res.status(500).send({ error: true, message: 'No Record Found!' });
  }
};

exports.getDamagedItem = async (req, res) => {
  const result = await DamagedItem.find({ _id: req.params.id, isDeleted: false });
  if (!result)
    return res.status(500).json({ error: true, message: 'No Record Found' });
  return res.status(200).send({ success: true, data: result });
};

exports.createDamagedItem = async (req, res, next) => {
  try {
    const { relatedStockRecord, damagedCurrentQty, purchasePrice, relatedProcedureItems, relatedMedicineItems, relatedAccessoryItems } = req.body;
    const stockUpdate = await Stock.findOneAndUpdate({ _id: relatedStockRecord }, { $inc: { qty: -damagedCurrentQty, batchPrice: -(damagedCurrentQty * purchasePrice) } }, { new: true })

    // Handle relatedProcedureItems
    if (relatedProcedureItems) {
      const stock = await Stock.find({ relatedProcedureItems: relatedProcedureItems })
      if (stock.length === 0) return res.status(200).send({ error: true, message: 'ProcedureItems Stock Not Found!' })
      const totalQty = stock.reduce((accumulator, current) => accumulator + current.qty, 0)
      console.log(totalQty)
      const update = await ProcedureItems.findOneAndUpdate({ _id: relatedProcedureItems }, { currentQuantity: totalQty })
    }

    // Handle relatedMedicineItems
    if (relatedMedicineItems) {
      const stock = await Stock.find({ relatedMedicineItems: relatedMedicineItems })
      if (stock.length === 0) return res.status(200).send({ error: true, message: 'MedicineItems Stock Not Found!' })
      const totalQty = stock.reduce((accumulator, current) => accumulator + current.qty, 0)
      console.log(totalQty)
      // Update MedicineItems
      const update = await MedicineItems.findOneAndUpdate({ _id: relatedMedicineItems }, { currentQuantity: totalQty })
    }

    // Handle relatedAccessoryItems
    if (relatedAccessoryItems) {
      const stock = await Stock.find({ relatedAccessoryItems: relatedAccessoryItems })
      if (stock.length === 0) return res.status(200).send({ error: true, message: 'AccessoryItems Stock Not Found!' })
      const totalQty = stock.reduce((accumulator, current) => accumulator + current.qty, 0)
      console.log(totalQty)
      // Update AccessoryItems
      const update = await AccessoryItems.findOneAndUpdate({ _id: relatedAccessoryItems }, { currentQuantity: totalQty })
    }

    const newDamagedItem = new DamagedItem(req.body);
    const result = await newDamagedItem.save();
    res.status(200).send({
      message: 'DamagedItem create success',
      success: true,
      data: result,
      update: stockUpdate
    });
  } catch (error) {
    return res.status(500).send({ "error": true, message: error.message })
  }
};


exports.updateDamagedItem = async (req, res, next) => {
  try {
    const result = await DamagedItem.findOneAndUpdate(
      { _id: req.body.id },
      req.body,
      { new: true },
    );
    return res.status(200).send({ success: true, data: result });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};

exports.deleteDamagedItem = async (req, res, next) => {
  try {
    const result = await DamagedItem.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: true },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })

  }
};

exports.activateDamagedItem = async (req, res, next) => {
  try {
    const result = await DamagedItem.findOneAndUpdate(
      { _id: req.params.id },
      { isDeleted: false },
      { new: true },
    );
    return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
  } catch (error) {
    return res.status(500).send({ "error": true, "message": error.message })
  }
};
