var Operation = require('./Operation.js');
var shellescape = require('shell-escape');
var inherits = require('util').inherits;


function OperationPublishSubscribe(eventNamePublish) {
    Operation.call(this);
    this.eventNamePublish = eventNamePublish;
    this.dataToPublish = null;
    this.subscribers = {};
}
inherits(OperationPublishSubscribe, Operation);

// Overwrite
OperationPublishSubscribe.prototype.makeOperation =
function(client, operationInfo, clientCallback) {
    var type = operationInfo.params.type;
    var hostname = client.ssh.config.host;

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
        clientCallback(this.dataToPublish[hostname]);
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
    this.showSubscribers();
    if(!this.isClientSubscribed(client)){
        var hostname = client.ssh.config.host;
        console.log("listJobs::subscribe::"+hostname+" client : " + client.params.username);

        if(this.subscribers[hostname] === undefined)
            this.subscribers[hostname] = [];
        this.subscribers[hostname].push(client);
        this.onSubscribe(client);
    }
    this.showSubscribers();
};

OperationPublishSubscribe.prototype.unsubscribe =
function(client) {
    this.showSubscribers();
    var i = this.getIndexClientInSubscribers(client);
    // Client existant
    if(i >= 0){
        var hostname = client.ssh.config.host;
        console.log("listJobs::unsubscribe::"+hostname+" client : " + client.params.username);

        // Delete the subscriber
        this.subscribers[hostname].splice(i--, 1);
        this.onUnsubscribe(client);
    }
    this.showSubscribers();
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
    var hostname = client.ssh.config.host;
    if(this.dataToPublish[hostname])
        client.socket.emit(this.eventNamePublish, this.dataToPublish[hostname]);
}

// Publish to all subscribers
OperationPublishSubscribe.prototype.publishDataBroadcast =
function(hostname){
    for (var i = 0; i < this.subscribers[hostname].length; i++) {
        this.publishDataClient(this.subscribers[hostname][i]);
    }
}

OperationPublishSubscribe.prototype.isClientSubscribed =
function(client){
    return this.getIndexClientInSubscribers(client) >= 0;
}

OperationPublishSubscribe.prototype.getIndexClientInSubscribers =
function(client){
    var hostname = client.ssh.config.host;

    if(this.subscribers[hostname] == undefined)
        return -1;

    // Delete the subscriber
    for (var i = 0; i < this.subscribers[hostname].length; i++) {
        if (this.subscribers[hostname][i].socket.id == client.socket.id) {
            return i;
        }
    }
    return -1;
}

OperationPublishSubscribe.prototype.showSubscribers =
function(){
    console.log("================ Subscribers '" + this.eventNamePublish +"' ================== ");
    for (var hostname in this.subscribers) {
        console.log("Hostname: " + hostname);
        console.log("Nb: " + this.subscribers[hostname].length);
        for (var i = 0; i < this.subscribers[hostname].length; i++) {
            console.log(" - " + this.subscribers[hostname][i].params.username + " (" + this.subscribers[hostname][i].socket.id + ")");
        }
    }
    console.log("================ =============== ================== ");
}

// export the class
module.exports = OperationPublishSubscribe;
