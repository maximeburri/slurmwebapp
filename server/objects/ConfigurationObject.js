var ObjectOperation = require('./ObjectOperation.js');
var inherits = require('util').inherits;

var GetConfigurationOperation =
    require('../operations/configuration/GetConfigurationOperation.js');

function ConfigurationObject() {
    ObjectOperation.call(this, {
        "get" : new GetConfigurationOperation(),
    });
}

inherits(ConfigurationObject, ObjectOperation);

// export the class
module.exports = ConfigurationObject;
