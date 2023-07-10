'use strict';
const AccountBalance = require('../models/accountBalance');

exports.listAllAccountBalances = async (req, res) => {
    let { keyword, role, limit, skip } = req.query;
    let count = 0;
    let page = 0;
    try {
        limit = +limit <= 100 ? +limit : 10; //limit
        skip = +skip || 0;
        let query = req.mongoQuery,
            regexKeyword;
        role ? (query['role'] = role.toUpperCase()) : '';
        keyword && /\w/.test(keyword)
            ? (regexKeyword = new RegExp(keyword, 'i'))
            : '';
        regexKeyword ? (query['name'] = regexKeyword) : '';
        let result = await AccountBalance.find(query).populate('relatedAccounting')
        count = await AccountBalance.find(query).count();
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

exports.getAccountBalance = async (req, res) => {
    let query = req.mongoQuery
    if (req.params.id) query._id = req.params.id
    const result = await AccountBalance.find(query).populate('relatedAccounting')
    if (result.length === 0)
        return res.status(500).json({ error: true, message: 'No Record Found' });
    return res.status(200).send({ success: true, data: result });
};

exports.createAccountBalance = async (req, res, next) => {
    let newBody = req.body;
    try {
        const newAccountBalance = new AccountBalance(newBody);
        const result = await newAccountBalance.save();
        res.status(200).send({
            message: 'AccountBalance create success',
            success: true,
            data: result
        });
    } catch (error) {
        // console.log(error )
        return res.status(500).send({ "error": true, message: error.message })
    }
};

exports.updateAccountBalance = async (req, res, next) => {
    try {
        const result = await AccountBalance.findOneAndUpdate(
            { _id: req.body.id },
            req.body,
            { new: true },
        ).populate('relatedAccounting')
        return res.status(200).send({ success: true, data: result });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};

exports.deleteAccountBalance = async (req, res, next) => {
    try {
        const result = await AccountBalance.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: true },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })

    }
}

exports.activateAccountBalance = async (req, res, next) => {
    try {
        const result = await AccountBalance.findOneAndUpdate(
            { _id: req.params.id },
            { isDeleted: false },
            { new: true },
        );
        return res.status(200).send({ success: true, data: { isDeleted: result.isDeleted } });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
};

exports.getClosing = async (req, res) => {
    try {
        const query = { relatedAccounting: req.query.relatedAccounting, type: req.query.type };
        const sort = { _id: -1 }; // Sort by descending _id to get the latest document
        const latestDocument = await AccountBalance.findOne(query, null, { sort });
        console.log(latestDocument)
        if (latestDocument === null) return res.status(404).send({ error: true, message: 'Not Found!' })
        const result = await AccountBalance.find({ _id: latestDocument._id }).populate('relatedAccounting')
        return res.status(200).send({ success: true, data: result });
    } catch (error) {
        return res.status(500).send({ "error": true, "message": error.message })
    }
}
