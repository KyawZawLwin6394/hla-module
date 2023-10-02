'use strict';
const Stock = require('../models/stock');
const MedicineItems = require('../models/medicineItem');
const AccessoryItems = require('../models/accessoryItem');
const ProcedureItems = require('../models/procedureItem');

exports.getInventoryPrice = async (req, res) => {
    let medicineItems = []
    let accessoryItems = []
    let procedureItems = []
    const response = {
    }
    const medItems = await MedicineItems.find({})
    const accItems = await AccessoryItems.find({})
    const proItems = await ProcedureItems.find({})
    for (const i of medItems) {
        console.log(i.medicineItemName, 'name')
        const result = await Stock.find({ relatedMedicineItems: i._id })
        const totalInventory = result.reduce((accumulator, item) => {
            const total = accumulator + (item.batchPrice || 0)
            console.log(total, 'total', item.batchPrice)
            return total
        }, 0);
        console.log(totalInventory, 'total')
        medicineItems.push(totalInventory)
    }
    for (const i of accItems) {
        const result = await Stock.find({ relatedAccessoryItems: i._id })
        const totalInventory = result.reduce((accumulator, item) => accumulator + (item.batchPrice || 0), 0);
        accessoryItems.push(totalInventory)
    }
    for (const i of proItems) {
        const result = await Stock.find({ relatedProcedureItems: i._id })
        const totalInventory = result.reduce((accumulator, item) => accumulator + (item.batchPrice || 0), 0);
        procedureItems.push(totalInventory)
    }
    response.medicineItems = medicineItems.reduce((accumulator, value) => accumulator + value)
    response.accessoryItems = accessoryItems.reduce((accumulator, value) => accumulator + value)
    response.procedureItems = procedureItems.reduce((accumulator, value) => accumulator + value)
    return res.status(200).send({ success: true, data: response })
}

exports.listAllStocks = async (req, res) => {
    let { keyword, role, limit, skip, relatedProcedureItems, relatedMedicineItems, relatedAccessoryItems, relatedMachine } = req.query;
    let count = 0;
    let page = 0;
    try {
        limit = +limit <= 100 ? +limit : 10; //limit
        skip = +skip || 0;
        let query = { isDeleted: false },
            regexKeyword;
        role ? (query['role'] = role.toUpperCase()) : '';
        keyword && /\w/.test(keyword)
            ? (regexKeyword = new RegExp(keyword, 'i'))
            : '';
        regexKeyword ? (query['name'] = regexKeyword) : '';
        let result = await Stock.find(query).populate('relatedProcedureItems relatedMedicineItems relatedAccessoryItems relatedMachine');
        count = await Stock.find(query).count();
        const division = count / limit;
        page = Math.ceil(division);

        res.status(200).send({
            success: true,
            count: count,
            _metadata: {
                current_page: skip / limit + 1,
                per_page: limit,
                page_count: page,
                total_count: count,
            },
            list: result,
        });
    } catch (e) {
        return res.status(500).send({ error: true, message: e.message });
    }
};

exports.getStock = async (req, res) => {
    const { relatedProcedureItems, relatedMedicineItems, relatedAccessoryItems, relatedMachine, start, end } = req.query;
    let query = { isDeleted: false }
    if (start && end) query.createdAt = { $gte: start, $lte: end }
    if (relatedProcedureItems) query.relatedProcedureItems = relatedProcedureItems;
    if (relatedMedicineItems) query.relatedMedicineItems = relatedMedicineItems;
    if (relatedAccessoryItems) query.relatedAccessoryItems = relatedAccessoryItems;
    if (relatedMachine) query.relatedMachine = relatedMachine;
    console.log(query)
    const result = await Stock.find(query).populate('relatedProcedureItems relatedMedicineItems relatedAccessoryItems relatedMachine')
    if (result.length === 0)
        return res.status(500).json({ error: true, message: 'No Record Found' });
    return res.status(200).send({ success: true, data: result });
};

exports.createStock = async (req, res, next) => {
    let newBody = req.body;
    try {
        const newStock = new Stock(newBody);
        const result = await newStock.save();
        res.status(200).send({
            message: 'Stock create success',
            success: true,
            data: result
        });
    } catch (error) {
        console.log(error)
        return res.status(500).send({ "error": true, message: error.message })
    }
};

exports.updateStock = async (req, res, next) => {
    try {
        const result = await Stock.findOneAndUpdate(
            { _id: req.body.id },
            req.body,
            { new: true },
        ).populate('relatedProcedureItems relatedMedicineItems relatedAccessoryItems relatedMachine')
        return res.status(200).send({ success: true, data: result });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};

exports.deleteStock = async (req, res, next) => {
    try {
        const result = await Stock.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: true },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })

    }
}

exports.activateStock = async (req, res, next) => {
    try {
        const result = await Stock.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: false },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};
