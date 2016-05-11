var ObjectOperation = require('./ObjectOperation.js');
var inherits = require('util').inherits;

var ListLicensesOperation = require('../operations/licenses/ListLicensesOperation.js');

function LicensesObject() {
    ObjectOperation.call(this, {
        "get" : new ListLicensesOperation(),
    });
}

inherits(LicensesObject, ObjectOperation);

// export the class
module.exports = LicensesObject;
