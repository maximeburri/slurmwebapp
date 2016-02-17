function ObjectController(objects) {
    this.objects = objects;
}

ObjectController.prototype.makeOperation =
function(client, operationInfo, clientCallback) {
    try {
        this.objects[operationInfo.object]
        .makeOperation(client, operationInfo, clientCallback);
    }
    catch(err) {
        console.error("Object not implemented or failed (ObjectController) : " + err);
        console.error(operationInfo);
        console.error(this.objects);
    }
};

ObjectController.prototype.onQuitClient =
function(client) {
    for (var object in this.objects) {
        this.objects[object].onQuitClient(client);
    }
};

// export the class
module.exports = ObjectController;
