var ObjectOperation = require('./ObjectOperation.js');
var inherits = require('util').inherits;

var ContentFileOperation = require('../operations/file/ContentFileOperation.js');

function FileObject() {
    ObjectOperation.call(this, {
        "get" : new ContentFileOperation(),
    });
}

inherits(FileObject, ObjectOperation);

// export the class
module.exports = FileObject;
