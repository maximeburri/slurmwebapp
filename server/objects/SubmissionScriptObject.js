var ObjectOperation = require('./ObjectOperation.js');
var inherits = require('util').inherits;

var LoadSubmissionScriptOperation =
    require('../operations/submissionScript/LoadSubmissionScriptOperation.js');

function SubmissionScriptObject() {
    ObjectOperation.call(this, {
        "load" : new LoadSubmissionScriptOperation()
    });
}

inherits(SubmissionScriptObject, ObjectOperation);

// export the class
module.exports = SubmissionScriptObject;
