angular.module('RDash').factory('Notification', [Notification]);

function Notification() {
    var nextNotificationId = 0;

    var PromiseSocketNotifiy = function (socket, deferred, attributesToSend) {
        this.deferred = deferred;
        this.socket = socket;
        this.notificationId = nextNotificationId;
        this.notifyEventName = "notify " + this.notificationId;
        this.socket.on(this.notifyEventName, function(){
            deferred.notify.apply(null, arguments);
        });
        attributesToSend["notifyEventName"] = this.notifyEventName;
        nextNotificationId++;

        PromiseSocketNotifiy.prototype.then = this.deferred.promise.then;
        PromiseSocketNotifiy.prototype.catch = this.deferred.promise.catch;
        PromiseSocketNotifiy.prototype.finally = this.deferred.promise.finally;
    };

    PromiseSocketNotifiy.prototype.stop = function () {
        console.log(this);
        console.log("registerNotify:"+"notify end "+this.notificationId);
        this.socket.emit("end " + this.notifyEventName);
        this.socket.removeListener(this.notifyEventName, this.notify);
        delete this.deferred.promise;
        delete this.deferred;
    };

    PromiseSocketNotifiy.prototype.notify = function () {
        console.log(this.deferred);
        this.deferred.notify.apply(this, arguments);
    };


    return PromiseSocketNotifiy;
}
