function ObjectOperation(operations) {
    this.operations = operations;
}

// class methods
ObjectOperation.prototype.makeOperation =
function(client, operationInfo, clientCallback) {
    try {
        this.operations[operationInfo.verb]
        .makeOperation(client, operationInfo, clientCallback);
    }
    catch(err) {
        console.error("Operation not implemented or failed (ObjectOperation) : " + err);
        console.error(err.stack);
        console.error(operationInfo);
    }
};

ObjectOperation.prototype.addOperation =
function(name, operation) {
    this.operations[name] = operation;
};

ObjectOperation.prototype.onQuitClient =
function(client) {
    for (var operation in this.operations) {
        this.operations[operation].onQuitClient(client);
    }
};


// export the class
module.exports = ObjectOperation;
