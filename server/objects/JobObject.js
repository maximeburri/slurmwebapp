var ObjectOperation = require('./ObjectOperation.js');
var inherits = require('util').inherits;

var CancelJobOperation = require('../operations/job/CancelJobOperation.js');

function JobObject() {
    ObjectOperation.call(this, {
        "cancel" : new CancelJobOperation()
    });
}

inherits(JobObject, ObjectOperation);

// export the class
module.exports = JobObject;
