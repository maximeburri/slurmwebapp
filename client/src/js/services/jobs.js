angular.module('RDash').service('Jobs', ['$q', '$rootScope', 'User', Jobs]);

function Jobs($q, $rootScope, User) {
    this.jobStateCodes = {
        // https://computing.llnl.gov/linux/slurm/squeue.html#SECTION_JOB STATE CODES
        'CA' : {
            completeName : "Annulé",
            description : "Le job à été explicitement annulé",
            icon :{
                name : "ban",
                color : "#B51818"
            }
        },
        'CD' : {
            completeName : "Terminé",
            description : "Le job est terminé",
            icon :{
                name : "check",
                color : "#163E16"
            }
        },
        'CF' : {
            completeName : "Configuration",
            description : "Le job est en cours de démarrage",
            icon :{
                name : "hourglass-start",
                color : "#163E16"
            }
        },
        'CG' : {
            completeName : "Achevement",
            description : "Le job est en train de terminé",
            icon :{
                name : "check",
                color : "orange"
            }
        },
        'F' : {
            completeName : "Echec",
            description : "Le job a terminé avec un code de sortie non nul",
            icon :{
                name : "times",
                color : "#B51818"
            }
        },
        'NF' : {
            completeName : "Défaillance",
            description : "Le job est prématurément terminé pour défaillance d'un noeud",
            icon :{
                name : "bolt",
                color : "#B51818"
            }
        },
        'PD' : {
            completeName : "Attente",
            description : "Le job est en attente d'allocation de ressources",
            icon :{
                name : "hourglass-start",
                color : "gray"
            }
        },
        'PR' : {
            completeName : "Préempté",
            description : "Le job terminé en raison de préemption",
            icon :{
                name : "eject",
                color : "#B51818"
            }
        },
        'R' : {
            completeName : "En cours",
            description : "Le job a actuellement une allocation",
            icon :{
                name : "play",
                color : "#163E16"
            }
        },
        'S' : {
            completeName : "Suspendu",
            description : "Le job a été suspendu",
            icon :{
                name : "pause",
                color : "gray"
            }
        },
        'TO' : {
            completeName : "Temps écoulé",
            description : "Le job a atteint sa limite de temps",
            icon :{
                name : "clock-o",
                color : "#B51818"
            }
        }
    };
    this.subscribed = false;
    var that = this;
    this.deferred = false;

    this.subscribe = function() {

        if(!this.subscribed){
            this.deferred = $q.defer();
            User.operation({verb:"subscribe", object:"jobs"}).then(
                // Success
                function(successMessage){
                    that.deferred.resolve(successMessage);
                },
                // Error
                function(err){
                    that.deferred.reject(err);
                    that.subscribed = false;
                }
            );
            User.socket.on('publish jobs', function(data) {
                that.deferred.notify(data);
            });
            this.subscribed = true;
        }
        console.log(this.deferred);
        return this.deferred.promise;
    };

    this.unsubscribe = function() {
        if(this.subscribed){
            // Unsubscribe
            User.socket.emit("unsubscribe jobs");
            User.socket.removeAllListeners("publish jobs");
            that.deferred.reject("end");
            this.subscribed = false;
        }
    };
}
