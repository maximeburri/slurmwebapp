var ObjectOperation = require('./ObjectOperation.js');
var inherits = require('util').inherits;

var InfoUserOperation = require('../operations/user/InfoUserOperation.js');

function UserObject() {
    ObjectOperation.call(this, {
        "get" : new InfoUserOperation()
    });
}

inherits(UserObject, ObjectOperation);

// export the class
module.exports = UserObject;
