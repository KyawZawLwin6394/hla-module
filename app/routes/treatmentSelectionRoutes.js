"use strict";

const treatmentSelection = require("../controllers/treatmentSelectionController");
const { catchError } = require("../lib/errorHandler");
const verifyToken = require('../lib/verifyToken');
const treatment = require("../models/treatment");
const upload = require('../lib/fieldUploader').upload;

module.exports = (app) => {

    app.route('/api/treatment-selection')
        .post(upload, verifyToken, catchError(treatmentSelection.createTreatmentSelection))
        .put(verifyToken, catchError(treatmentSelection.updateTreatmentSelection))

    app.route('/api/treatment-selection/:id')
        .get(verifyToken, catchError(treatmentSelection.getTreatmentSelection))
        .delete(verifyToken, catchError(treatmentSelection.deleteTreatmentSelection))
        .post(verifyToken, catchError(treatmentSelection.activateTreatmentSelection))

    app.route('/api/treatment-selections').get(verifyToken, catchError(treatmentSelection.listAllTreatmentSelections))

    app.route('/api/treatment-selections/transaction').post(verifyToken, catchError(treatmentSelection.createTreatmentTransaction))
    app.route('/api/treatment-selections/treatment/:id').get(verifyToken, catchError(treatmentSelection.getTreatementSelectionByTreatmentID))
    app.route('/api/treatment-selections/payment').put(upload, verifyToken, catchError(treatmentSelection.treatmentPayment))
    app.route('/api/treatment-selections/filter').post(verifyToken, catchError(treatmentSelection.getRelatedTreatmentSelections))
    app.route('/api/treatment-selections/search').post(verifyToken, catchError(treatmentSelection.searchTreatmentSelections))
    app.route('/api/treatment-selections/code').get(verifyToken, catchError(treatmentSelection.createTreatmentSelectionCode))
    app.route('/api/treatment-selections/profit-and-loss').get(verifyToken, catchError(treatmentSelection.profitAndLossForEveryMonth))

};
