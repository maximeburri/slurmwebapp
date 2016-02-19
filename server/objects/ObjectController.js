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
function(client, callbackFinish) {
    var nbFinish = 0;
    var nbTotal = Object.keys(this.objects).length;

    for (var object in this.objects) {
        this.objects[object].onQuitClient(client,

        // Callback when one finish
        function(){
            nbFinish++;

            // All finish ? Call callback
            if(nbFinish >= nbTotal){
                if(callbackFinish != undefined)
                    callbackFinish.call(this);
            }
        });
    }
};

// export the class
module.exports = ObjectController;
