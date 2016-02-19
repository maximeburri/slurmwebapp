function Operation() {

}

// class methods
Operation.prototype.makeOperation =
function(client, operationInfo, clientCallback) {
    console.error("Operation not implemented");
    console.error(operationInfo);
};

// To override
Operation.prototype.onQuitClient =
function(client, callbackFinish) {
    // Need to call that at the end
    if(callbackFinish != undefined)
        callbackFinish.call(this);
};

// export the class
module.exports = Operation;
