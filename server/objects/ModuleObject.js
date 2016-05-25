var ObjectOperation = require('./ObjectOperation.js');
var inherits = require('util').inherits;

var DetailModuleOperation = require('../operations/module/DetailModuleOperation.js');

function ModuleObject() {
    ObjectOperation.call(this, {
        "get" : new DetailModuleOperation(),
    });
}

inherits(ModuleObject, ObjectOperation);

// export the class
module.exports = ModuleObject;
