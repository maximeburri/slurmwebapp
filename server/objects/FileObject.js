var ObjectOperation = require('./ObjectOperation.js');
var inherits = require('util').inherits;

var ContentFileOperation = require('../operations/file/ContentFileOperation.js');
var UploadFileOperation = require('../operations/file/UploadFileOperation.js');
var RemoveFileOperation = require('../operations/file/RemoveFileOperation.js');

function FileObject() {
    ObjectOperation.call(this, {
        "get" : new ContentFileOperation(),
        "upload" : new UploadFileOperation(),
        "remove" : new RemoveFileOperation()
    });
}

inherits(FileObject, ObjectOperation);

// export the class
module.exports = FileObject;
