angular.module('RDash').service('Jobs', ['$q', '$rootScope', 'User', Jobs]);

function Jobs($q, $rootScope, User) {
    this.jobStateCodes = {
        // https://computing.llnl.gov/linux/slurm/squeue.html#SECTION_JOB STATE CODES
        'CANCELLED' : {
            completeName : "Annulé",
            description : "Le job à été explicitement annulé",
            icon :{
                name : "ban",
                class : "text-danger"
            }
        },
        'COMPLETED' : {
            completeName : "Terminé",
            description : "Le job est terminé",
            icon :{
                name : "check",
                class : "text-success"
            }
        },
        'CONFIGURING' : {
            completeName : "Configuration",
            description : "Le job est en cours de démarrage",
            icon :{
                name : "hourglass-start",
                class : "text-success"
            }
        },
        'COMPLETING' : {
            completeName : "Achevement",
            description : "Le job est en train de terminé",
            icon :{
                name : "check",
                class : "text-warning"
            }
        },
        'FAILED' : {
            completeName : "Echec",
            description : "Le job a terminé avec un code de sortie non nul",
            icon :{
                name : "times",
                class : "text-danger"
            }
        },
        'NODE_FAIL' : {
            completeName : "Défaillance",
            description : "Le job est prématurément terminé pour défaillance d'un noeud",
            icon :{
                name : "bolt",
                class : "text-danger"
            }
        },
        'PENDING' : {
            completeName : "Attente",
            description : "Le job est en attente d'allocation de ressources",
            icon :{
                name : "hourglass-start",
                class : "gray"
            }
        },
        'PREEMPTED' : {
            completeName : "Préempté",
            description : "Le job terminé en raison de préemption",
            icon :{
                name : "eject",
                class : "text-danger"
            }
        },
        'RUNNING' : {
            completeName : "En cours",
            description : "Le job a actuellement une allocation",
            icon :{
                name : "play",
                class : "text-success"
            }
        },
        'SUSPENDED' : {
            completeName : "Suspendu",
            description : "Le job a été suspendu",
            icon :{
                name : "pause",
                class : "gray"
            }
        },
        'TIMEOUT' : {
            completeName : "Temps écoulé",
            description : "Le job a atteint sa limite de temps",
            icon :{
                name : "clock-o",
                class : "text-danger"
            }
        }
    };
    this.subscribed = false;
    var that = this;
    this.deferred = false;

    this.subscribe = function() {

        if(!this.subscribed){
            this.deferred = $q.defer();
            User.operation({verb:"list", object:"jobs", params:{type:"subscribe"}}).then(
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
            User.socket.on('list jobs update', function(data) {
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
            User.operation({verb:"list", object:"jobs", params:{type:"unsubscribe"}});
            User.socket.removeAllListeners("list jobs update");
            that.deferred.reject("end");
            this.subscribed = false;
        }
    };
}
