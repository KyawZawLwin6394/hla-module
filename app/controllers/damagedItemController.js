'use strict';
const DamagedItem = require('../models/damagedItem');
const Stock = require('../models/stock');

exports.listAllDamagedItems = async (req, res) => {
  try {
    let result = await DamagedItem.find({ isDeleted: false });
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
    const { relatedStockRecord, damagedCurrentQty, damagedTotalUnit } = req.body;
    const stockUpdate = await Stock.findOneAndUpdate({ _id: relatedStockRecord }, { $inc: { qty: -damagedCurrentQty, totalUnit: -damagedTotalUnit } }, { new: true })
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
