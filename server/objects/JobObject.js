var ObjectOperation = require('./ObjectOperation.js');
var inherits = require('util').inherits;

var CancelJobOperation = require('../operations/job/CancelJobOperation.js');
var DetailJobOperation = require('../operations/job/DetailJobOperation.js');
var EstimationJobOperation = require('../operations/job/EstimationJobOperation.js');
var SubmitJobOperation = require('../operations/job/SubmitJobOperation.js');

function JobObject() {
    ObjectOperation.call(this, {
        "cancel" : new CancelJobOperation(),
        "detail" : new DetailJobOperation(),
        "estimate" : new EstimationJobOperation(),
        "submit" : new SubmitJobOperation()
    });
}

inherits(JobObject, ObjectOperation);

// export the class
module.exports = JobObject;
