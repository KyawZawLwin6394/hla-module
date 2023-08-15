"use strict";

const stock = require("../controllers/stockController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/stock')
        .post(verifyToken, catchError(stock.createStock))
        .put(verifyToken, catchError(stock.updateStock))

    app.route('/api/stock/:id')
        .delete(verifyToken, catchError(stock.deleteStock))
        .post(verifyToken, catchError(stock.activateStock))
    app.route('/api/stock/stock-record')
        .get(verifyToken, catchError(stock.getStock))
    app.route('/api/stocks').get(verifyToken, catchError(stock.listAllStocks))
};
