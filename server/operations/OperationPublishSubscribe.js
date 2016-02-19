var Operation = require('./Operation.js');
var shellescape = require('shell-escape');
var inherits = require('util').inherits;


function OperationPublishSubscribe(eventNamePublish) {
    Operation.call(this);
    this.eventNamePublish = eventNamePublish;
    this.dataToPublishToPublish = null;
    this.subscribers = [];
}
inherits(OperationPublishSubscribe, Operation);

// Overwrite
OperationPublishSubscribe.prototype.makeOperation =
function(client, operationInfo, clientCallback) {
    var type = operationInfo.params.type;

    // Inscription
    if(type == "subscribe"){
        this.subscribe(client);
    }
    // Désinscription
    else if(type == "unsubscribe"){
        this.unsubscribe(client);
    }
    // Simple demande
    else{
        clientCallback(this.dataToPublish);
    }
};

OperationPublishSubscribe.prototype.onQuitClient =
function(client, callbackFinish) {
    this.unsubscribe(client);
    if(callbackFinish != undefined)
        callbackFinish.call(this);
};

OperationPublishSubscribe.prototype.subscribe =
function(client) {
    if(!this.isClientSubscribed(client)){
        this.subscribers.push(client);
        this.onSubscribe(client);
    }
};

OperationPublishSubscribe.prototype.unsubscribe =
function(client) {
    var i = this.getIndexClientInSubscribers(client);
    // Client existant
    if(i >= 0){
        // Delete the subscriber
        this.subscribers.splice(i--, 1);
        this.onUnsubscribe(client);
    }
};

// To override
OperationPublishSubscribe.prototype.onUnsubscribe =
function(client){
    console.warn("onUnsubscribe not implemented");
}

// To override
OperationPublishSubscribe.prototype.onSubscribe =
function(client){
    console.warn("onSubscribe not implemented");
}

// Publish to one client
OperationPublishSubscribe.prototype.publishDataClient =
function(client){
    client.socket.emit(this.eventNamePublish, this.dataToPublish);
}

OperationPublishSubscribe.prototype.getCountSubscribers =
function(){
    return this.subscribers.length;
}

// Publish to all subscribers
OperationPublishSubscribe.prototype.publishDataBroadcast =
function(client){
    for (var i = 0; i < this.subscribers.length; i++) {
        this.publishDataClient(this.subscribers[i]);
    }
}

OperationPublishSubscribe.prototype.isClientSubscribed =
function(client){
    return this.getIndexClientInSubscribers(client) >= 0;
}

OperationPublishSubscribe.prototype.getIndexClientInSubscribers =
function(client){
    // Delete the subscriber
    for (var i = 0; i < this.subscribers.length; i++) {
        if (this.subscribers[i].socket.id == client.socket.id) {
            return i;
        }
    }
    return -1;
}

OperationPublishSubscribe.prototype.showSubscribers =
function(){
    console.log("================ Subscribers '" + this.eventNamePublish +"' ================== ");
    console.log("Nb: " + this.subscribers.length);
    for (var i = 0; i < this.subscribers.length; i++) {
        console.log(" - " + this.subscribers[i].params.username + " (" + this.subscribers[i].socket.id + ")");
    }
    console.log("================ Subscribers " + this.eventNamePublish +" ================== ");
}

// export the class
module.exports = OperationPublishSubscribe;
