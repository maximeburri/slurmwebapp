var ObjectOperation = require('./ObjectOperation.js');
var inherits = require('util').inherits;

var ContentFileOperation = require('../operations/file/ContentFileOperation.js');
var UploadFileOperation = require('../operations/file/UploadFileOperation.js');

function FileObject() {
    ObjectOperation.call(this, {
        "get" : new ContentFileOperation(),
        "upload" : new UploadFileOperation(),
    });
}

inherits(FileObject, ObjectOperation);

// export the class
module.exports = FileObject;
