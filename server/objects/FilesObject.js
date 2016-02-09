var ObjectOperation = require('./ObjectOperation.js');
var inherits = require('util').inherits;

var ListFilesOperation = require('../operations/files/ListFilesOperation.js');

function FilesObject() {
    ObjectOperation.call(this, {
        "get" : new ListFilesOperation(),
    });
}

inherits(FilesObject, ObjectOperation);

// export the class
module.exports = FilesObject;
