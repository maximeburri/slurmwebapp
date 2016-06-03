var ObjectOperation = require('./ObjectOperation.js');
var inherits = require('util').inherits;

var LoadSubmissionScriptOperation =
    require('../operations/submissionScript/LoadSubmissionScriptOperation.js');
var SaveSubmissionScriptOperation =
    require('../operations/submissionScript/SaveSubmissionScriptOperation.js');

function SubmissionScriptObject() {
    ObjectOperation.call(this, {
        "load" : new LoadSubmissionScriptOperation(),
        "save" : new SaveSubmissionScriptOperation()
    });
}

inherits(SubmissionScriptObject, ObjectOperation);

// export the class
module.exports = SubmissionScriptObject;
