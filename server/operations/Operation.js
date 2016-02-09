function Operation() {

}

// class methods
Operation.prototype.makeOperation =
function(client, operationInfo, clientCallback) {
    console.error("Operation not implemented");
    console.error(operationInfo);
};

// export the class
module.exports = Operation;
