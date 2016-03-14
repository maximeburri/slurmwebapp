var OperationPublishSubscribe = require('../OperationPublishSubscribe.js');
var shellescape = require('shell-escape');
var inherits = require('util').inherits;

var config = require('../../config');

function ListJobsOperation() {
    OperationPublishSubscribe.call(this, "list jobs update");

    /* Dictionnary of hostname, exemple :
        {
            "baobab.unige.ch":{
                date:1019191;
                jobs:[]
            }
        }
    */
    this.dataToPublish = {}

    /* Dictionnary of hostname, exemple :
        {
            "baobab.unige.ch":{
                timeoutFunction : null, << Timeout function returned by setTimeout (use for clearTimeout)
                lastRequest : 2222, << the last request,
                jobs :{
                        text : "", << the text not parsed outputed
                        objects : [], << the jobs objects parsed
                }
            }
        }
    */
    this.jobsInfo = {}
}
inherits(ListJobsOperation, OperationPublishSubscribe);

// To override
ListJobsOperation.prototype.onUnsubscribe =
function(client){
    var hostname = client.ssh.config.host;

    if(this.subscribers[hostname].length == 0 && this.jobsInfo[hostname].timeoutFunction != null){
        clearTimeout(this.jobsInfo[hostname].timeoutFunction);
        this.jobsInfo[hostname].timeoutFunction = null;
    }
}

// To override
ListJobsOperation.prototype.onSubscribe =
function(client){
    var hostname = client.ssh.config.host;

    if(this.subscribers[hostname].length == 1 &&
        (this.jobsInfo[hostname] === undefined || this.jobsInfo[hostname].timeoutFunction === null)){
        this.jobsInfo[hostname] = {
            lastRequest : 0,
            timeoutFunction : null,
            jobs : {
                text : "",
                objects : []
            }
        };
        this.jobsInfo[hostname].timeoutFunction =
            setTimeout(this.updateJobsLoop, 0, hostname, this);
    }
    this.publishDataClient(client);
}

ListJobsOperation.prototype.updateJobsLoop =
function(hostname, self){

    if(self.subscribers[hostname].length == 0)
        return;

    var client = self.subscribers[hostname][Math.floor(Math.random() * self.subscribers[hostname].length)];

    if(client == undefined)
        return;

    var result = "";
    var exitcode = 0;

    // Squeue with SLURM_TIME_FORMAT == timestamp
    var command = "env SLURM_TIME_FORMAT=\"%s\" squeue -a --states=all --format=\"%i %P %j %u %T %S %C %R %e %l %S %V\"";

    console.log("Execute squeue with " + client.socket.id);
    self.showSubscribers();
    try {
        client.ssh.exec(command, function(err, stream) {
            if (err) console.error(err.stack);
            else
                stream.on('data', function(data) {
                    result += data;
                }).on('exit', function(e) {
                    //console.log('EXIT: ' + e);
                    exitcode = e;
                }).on('end', function(){
                    //console.log('CLOSE');
                    if(exitcode == 0){
                        if(self.jobsInfo[hostname].jobs.text != result){
                            self.jobsInfo[hostname].jobs.text = result;
                            self.jobsInfo[hostname].lastRequest = Date.now();
                            self.jobsInfo[hostname].jobs.objects = self.parseJobs(result);
                            self.dataToPublish[hostname] = {
                                date:self.jobsInfo[hostname].lastRequest,
                                jobs:self.jobsInfo[hostname].jobs.objects
                            }

                            self.publishDataBroadcast(hostname);
                        }
                    }
                    if(self.subscribers[hostname].length >= 0)
                        self.jobsInfo[hostname].timeoutFunction =
                            setTimeout(self.updateJobsLoop, config.jobs.interval_update, hostname, self);
                    else
                        self.jobsInfo[hostname].timeoutFunction = null;
                })
                .stderr.on('data', function(data) {
                    console.log('squeue STDERR: ' + data);
                });
        });
    }catch(err) {
        console.error("updateJobsLoop : client ssh error");
        // Une erreur s'est produite, directement remettre à jour les jobs
        if(self.subscribers[hostname].length >= 0)
            self.jobsInfo[hostname].timeoutFunction =
                setTimeout(self.updateJobsLoop, config.jobs.interval_update, hostname, self);
        else
            self.jobsInfo[hostname].timeoutFunction = null;
    }
}

// Parse jobs formated %i %P %j %u %T %S %C %R %e %l %S %V
ListJobsOperation.prototype.parseJobs =
function (text){
    var result = [];

    var lines = text.split('\n');

    for(i = 1; i < lines.length-1;i++){
        var job = lines[i].split(' ');
        var nodesList = job.length > 7 ? job[7] : "";
        var reasonWaiting = null;
        if(nodesList.length >= 3 && nodesList[0] == '(' && nodesList[nodesList.length - 1] == ')'){
            reasonWaiting = nodesList.slice(1,-1);
            nodesList = null;
        }
        if(nodesList == ''){
            nodesList = null;
        }
        var timeJobStart = job[5];
        var timeLeftExecute = job[10];
        var timeJobEnd = job[8];
        var timeJobSubmit = job[11];

        timeJobStart = (timeJobStart == 'N/A') ? null : parseInt(timeJobStart);
        timeLeftExecute = (timeLeftExecute == 'N/A') ? null : parseInt(timeLeftExecute);
        timeJobEnd = (timeJobEnd == 'N/A') ? null : parseInt(timeJobEnd);
        timeJobSubmit = (timeJobEnd == 'N/A') ? null : parseInt(timeJobSubmit);

        result.push({
            'id' : job[0],
            'partition' : job[1],
            'name' : job[2],
            'username' : job[3],
            'state' : job[4],
            'timeJobStart' : timeJobStart,
            'nbCPU' : job[6],
            'nodes' : nodesList,
            'reasonWaiting' : reasonWaiting,
            'timeJobEnd' : timeJobEnd,
            'timeLimit' : job[9],
            'timeLeftExecute' : timeLeftExecute,
            'timeJobSubmit' : timeJobSubmit
        });
    }

    return result;
}

// export the class
module.exports = ListJobsOperation;
