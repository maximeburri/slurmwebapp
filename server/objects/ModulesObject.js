var ObjectOperation = require('./ObjectOperation.js');
var inherits = require('util').inherits;

var ListModulesOperation = require('../operations/modules/ListModulesOperation.js');

function ModulesObject() {
    ObjectOperation.call(this, {
        "get" : new ListModulesOperation(),
    });
}

inherits(ModulesObject, ObjectOperation);

// export the class
module.exports = ModulesObject;
