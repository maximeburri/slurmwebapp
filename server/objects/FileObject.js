var ObjectOperation = require('./ObjectOperation.js');
var inherits = require('util').inherits;

var ContentFileOperation = require('../operations/file/ContentFileOperation.js');
var UploadFileOperation = require('../operations/file/UploadFileOperation.js');
var RemoveFileOperation = require('../operations/file/RemoveFileOperation.js');
var MoveFileOperation = require('../operations/file/MoveFileOperation.js');
var NewFileOperation = require('../operations/file/NewFileOperation.js');
var CopyFileOperation = require('../operations/file/CopyFileOperation.js');

function FileObject() {
    ObjectOperation.call(this, {
        "get" : new ContentFileOperation(),
        "upload" : new UploadFileOperation(),
        "remove" : new RemoveFileOperation(),
        "move" : new MoveFileOperation(),
        "new" : new NewFileOperation(),
        "copy" : new CopyFileOperation(),
    });
}

inherits(FileObject, ObjectOperation);

// export the class
module.exports = FileObject;
