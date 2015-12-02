angular.module('RDash').service('User', ['$q', '$rootScope', 'Notification', User]);

function User($q, $rootScope, Notification) {
    var that = this;
    var idNotify = 0;
    this.socket = false;
    this.authenticated = false;

    this.isAuthenticated = function() {
        return this.authenticated;
    };

    this.connect = function(params) {
        console.log("Connect");
        var deferred = $q.defer();

        if(!this.socket && !this.socket.connected){
            // Try connect
            this.authenticated = false;
            this.socket = io.connect("https://"+params.bridge,
                {
                    secure:true,
                    reconnectionAttempts: 3,
                    reconnectionDelay: 200,
                    'force new connection': true
                }
            );

            // Conncted on socket
            this.socket.on('connect', function() {
                deferred.notify('socket-connected');
                // Try login
                that.socket.emit("login", params);
            });

            // Error
            this.socket.on('error', function(data) {
                console.log('error');
                console.log(data);
            });

            // Connect error
            this.socket.on('connect_error', function(data) {
                console.log('connect_error');
                console.log(data);
            });

            // Reconnect error
            this.socket.on('reconnect_error', function(data) {
                console.log('reconnect_error');
                console.log(data);
            });

            // Reconnect faild
            this.socket.on('connect_failed', function(data) {
                deferred.reject('socket-timeout');
                console.log('reconnect_failed');
                console.log(data);
                that.socket = false;
                that.authenticated = false;
            });

            // Reconnect faild
            this.socket.on('reconnect_failed', function(data) {
                deferred.reject('socket-timeout');
                console.log('reconnect_failed');
                console.log(data);
                that.socket = false;
                that.authenticated = false;
            });

            // SSH error
            this.socket.on("error_ssh", function(data){
                that.authenticated = false;

                // Disconnect the socket
                that.socket.disconnect();

                // Check type ssh connection error
                err = "ssh-connection";
                if(data.level != undefined &&
                    data.level == "client-authentication")
                    err ="client-authentication";
                deferred.reject(err);

                console.log("Error ssh: ");
                console.log(data);
            });

            // On disconnect
            this.socket.on('disconnect', function() {
                console.log("Disconnected");
                that.socket = false;
                that.authenticated = false;
            });

            // On authenticated
            this.socket.on("authenticated", function(data){
                that.authenticated = true;
                deferred.resolve('authenticated');
                console.log("Authenticated");
                console.log(data);
            });

            // On logout
            this.socket.on("logout", function(data){
                console.log("Lougouted");
                console.log(data);
                that.socket = false;
                that.authenticated = false;
            });
        }else{
            deferred.reject('already-connected');
        }

        return deferred.promise;
    };

    this.operation = function(operationAttributes, notify){
        var deferred = $q.defer();

        var promiseSocketNotifiy = false;
        if(notify){
            promiseSocketNotifiy =
                new Notification(this.socket, deferred,operationAttributes);

        }

        if(that.socket && that.socket.connected){
            that.socket.emit("operation", operationAttributes, function(data, err){
                if(err)
                    deferred.reject(err);
                else
                    deferred.resolve(data);
            });
        }else {
            deferred.reject("NOT CONNECTED");
        }
        if(promiseSocketNotifiy)
            return promiseSocketNotifiy;
        return deferred.promise;
    };

    this.get = function(object, params, notify){
        return that.operation({verb:"get", object:object, params:params}, notify);
    };
}
