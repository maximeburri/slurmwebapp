var OperationPublishSubscribe = require('../OperationPublishSubscribe.js');
var shellescape = require('shell-escape');
var inherits = require('util').inherits;

var config = require('../../config');

function ListJobsOperation() {
    OperationPublishSubscribe.call(this, "list jobs update");
    this.dataToPublish = {
        date:0,
        jobs:[]
    }
    this.jobsInfo = {
        lastRequest : 0,
        jobs : {
            text : "",
            objects : []
        }
    }
}
inherits(ListJobsOperation, OperationPublishSubscribe);

// To override
ListJobsOperation.prototype.onUnsubscribe =
function(client){
    if(this.subscribers.length == 0){
        clearTimeout(this.updateJobsLoop);
    }
}

// To override
ListJobsOperation.prototype.onSubscribe =
function(client){
    if(this.subscribers.length == 1){
        this.updateJobsLoop(this);
    }else{
        this.publishDataClient(client);
    }
}

ListJobsOperation.prototype.updateJobsLoop =
function(self){
    if(self.getCountSubscribers() == 0)
        return;

    var client = self.subscribers[Math.floor(Math.random() * self.subscribers.length)];

    if(client == undefined)
        return;

    var result = "";
    var exitcode = 0;

    console.log("Try exec squeue");
    self.showSubscribers();
    console.log("Choosen : " + client.socket.id);
    try {
        client.ssh.exec("squeue -a --states=all --format=\"%i %P %j %u %T %M %C %R\"", function(err, stream) {
            if (err) throw err;
            stream.on('data', function(data) {
                result += data;
            }).on('exit', function(e) {
                console.log('EXIT: ' + e);
                exitcode = e;
            }).on('end', function(){
                console.log('CLOSE');
                if(exitcode == 0){
                    if(self.jobsInfo.jobs.text != result){
                        self.jobsInfo.jobs.text = result;
                        self.jobsInfo.lastRequest = Date.now();
                        self.jobsInfo.jobs.objects = self.parseJobs(result);
                        self.dataToPublish = {
                            date:self.jobsInfo.lastRequest,
                            jobs:self.jobsInfo.jobs.objects
                        }

                        self.publishDataBroadcast();
                    }
                }
                if(self.subscribers.length >= 0)
                    setTimeout(self.updateJobsLoop, config.jobs.interval_update, self);
            })
            .stderr.on('data', function(data) {
                console.log('STDERR: ' + data);
            });
        });
    }catch(err) {
        console.error("updateJobsLoop : client ssh error");
        // Une erreur s'est produite, directement remettre à jour les jobs
        if(self.getCountSubscribers() >= 0)
            setTimeout(self.updateJobsLoop, config.jobs.interval_update, self);
    }
}

// Parse jobs formated %i %P %j %u %T %M %C %R
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
        result.push({
            'id' : job[0],
            'partition' : job[1],
            'name' : job[2],
            'username' : job[3],
            'state' : job[4],
            'time' : job[5],
            'nbCPU' : job[6],
            'nodes' : nodesList,
            'reasonWaiting' : reasonWaiting
        });
    }

    return result;
}

// export the class
module.exports = ListJobsOperation;
