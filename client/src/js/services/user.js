angular.module('RDash').service('User', function() {
    var that = this;
    this.socket = false;
    this.connected = false;
    this.connectionProcessing = false;

    this.isConnected = function() {
        return connected;
    };

    this.connect = function(params, callbackConnected, callbackProcessing) {
        if(!that.socket){
            that.connectionProcessing = true;
            callbackProcessing(that.connectionProcessing);

            that.socket = io.connect(params.bridge);
            that.socket.on("message", function(data){
                console.log("Message: " + data);
            });

            that.socket.on("error_ssh", function(data){
                that.connectionProcessing = false;
                callbackProcessing(that.connectionProcessing);
                that.connected = false;
                callbackConnected(that.connected);
                console.log("Error ssh: ");
                console.log(data);
                that.socket.disconnect();
                that.socket = false;
            });

            that.socket.on("authenticated", function(data){
                that.connectionProcessing = false;
                callbackProcessing(that.connectionProcessing);
                that.connected = true;
                callbackConnected(that.connected);
                console.log("Authentified !");
                console.log(data);
            });

            that.socket.on("logout", function(data){
                console.log("Lougouted");
                console.log(data);
                that.connected = false;
                callbackConnected(that.connected);
            });

            if(that.socket){
                that.socket.emit("login", params);
            }
        }
    };

    this.operation = function(operationAttributes, callback){
        that.socket.emit("operation", operationAttributes, callback);
    };

    this.get = function(object, params, callback){
        that.operation({verb:"get", object:object, params:params}, callback);
    };
});
