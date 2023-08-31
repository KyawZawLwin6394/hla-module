"use strict";

const damagedItem = require("../controllers/damagedItemController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');

module.exports = (app) => {

    app.route('/api/damaged-item')
        .post(verifyToken, catchError(damagedItem.createDamagedItem))
        .put(verifyToken, catchError(damagedItem.updateDamagedItem))
        
    app.route('/api/damaged-item/:id')
        .get(verifyToken, catchError(damagedItem.getDamagedItem))
        .delete(verifyToken, catchError(damagedItem.deleteDamagedItem)) 
        .post(verifyToken, catchError(damagedItem.activateDamagedItem))

    app.route('/api/damaged-items').get(verifyToken, catchError(damagedItem.listAllDamagedItems))
};
