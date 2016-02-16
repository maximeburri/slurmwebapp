var ObjectOperation = require('./ObjectOperation.js');
var inherits = require('util').inherits;

var ListJobsOperation = require('../operations/jobs/ListJobsOperation.js');

function JobsObject() {
    ObjectOperation.call(this, {
        "list" : new ListJobsOperation(),
    });
}

inherits(JobsObject, ObjectOperation);

// export the class
module.exports = JobsObject;
