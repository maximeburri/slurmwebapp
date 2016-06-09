var ObjectOperation = require('./ObjectOperation.js');
var inherits = require('util').inherits;

var InfoClusterOperation = require('../operations/cluster/InfoClusterOperation.js');

function ClusterObject() {
    ObjectOperation.call(this, {
        "get" : new InfoClusterOperation()
    });
}

inherits(ClusterObject, ObjectOperation);

// export the class
module.exports = ClusterObject;
