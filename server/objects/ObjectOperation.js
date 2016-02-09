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
        console.error(operationInfo);
        console.error(this.operations);
    }
};

ObjectOperation.prototype.addOperation =
function(name, operation) {
    this.operations[name] = operation;
};


// export the class
module.exports = ObjectOperation;
