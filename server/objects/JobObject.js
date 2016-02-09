var ObjectOperation = require('./ObjectOperation.js');
var inherits = require('util').inherits;

var CancelJobOperation = require('../operations/job/CancelJobOperation.js');
var DetailJobOperation = require('../operations/job/DetailJobOperation.js');

function JobObject() {
    ObjectOperation.call(this, {
        "cancel" : new CancelJobOperation(),
        "detail" : new DetailJobOperation()
    });
}

inherits(JobObject, ObjectOperation);

// export the class
module.exports = JobObject;
