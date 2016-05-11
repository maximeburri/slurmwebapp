var ObjectOperation = require('./ObjectOperation.js');
var inherits = require('util').inherits;

var ListPartitionsOperation = require('../operations/partitions/ListPartitionsOperation.js');

function PartitionsObject() {
    ObjectOperation.call(this, {
        "get" : new ListPartitionsOperation(),
    });
}

inherits(PartitionsObject, ObjectOperation);

// export the class
module.exports = PartitionsObject;
