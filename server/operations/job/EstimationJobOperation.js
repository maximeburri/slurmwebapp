var Operation = require('../Operation.js');
var shellescape = require('shell-escape');
var inherits = require('util').inherits;

function EstimationJobOperation() {
    Operation.call(this);

    this.valuesParamsArgs = [
        {
            paramName : "partition",
            args : "--partition"
        },
        {
            paramName : "nbTasks",
            args : "--ntasks"
        },
        {
            paramName : "nbCPUsPerTasks",
            args : "--cpus-per-task"
        }
    ]
}
inherits(EstimationJobOperation, Operation);

// Overwrite
EstimationJobOperation.prototype.makeOperation =
function(client, operationInfo, clientCallback) {
    var cmd = "srun --test-only";

    this.valuesParamsArgs.forEach(function(paramArg){
        if(operationInfo.params[paramArg.paramName] !== undefined){
            cmd += " " + paramArg.args + " " + shellescape([operationInfo.params[paramArg.paramName]]);
        }
    });

    // Warning, the srun result print in STDERR !
    var stderr = "";

    client.executeCommand(cmd,
        // FINISH
        function(result, exitcode, clientCallback){
            if(exitcode != 0){
                clientCallback(null, {error:"ESTIMATION_FAIL"});
            }else{
                stderr = stderr.toString().slice(0, -1)
                var words = stderr.split(' ');
                var jobId = null;
                var estimatedTime = null;
                var nbProcessors = null;
                var nodes = null;
                if(!(words && words.length))
                    clientCallback(null, {error:"ESTIMATION_FAIL"});

                for(var i = 0;i<words.length;i++){
                    if(words[i] == "Job" && (i+1)<words.length){
                        integer = parseInt(words[i+1]);
                        if(integer !== NaN){
                            jobId = integer;
                            i++;
                            continue;
                        }
                    }
                    if(words[i] == "at" && (i+1)<words.length){
                        estimatedTime = words[i+1];
                        i++;
                        continue;
                    }
                    if(words[i] == "using" && (i+2)<words.length && words[i+2] == "processors"){
                        integer = parseInt(words[i+1]);
                        if(integer !== NaN){
                            nbProcessors = integer;
                            i+=2;
                            continue;
                        }
                    }
                    if(words[i] == "on" && (i+1)<words.length){
                        nodes = words[i+1];
                        i++;
                        continue;
                    }
                }
                clientCallback({
                    result        : stderr.toString(),
                    jobId         : jobId,
                    estimatedTime : estimatedTime,
                    nbProcessors  : nbProcessors,
                    nodes         : nodes
                }, false);
            }
        },
        clientCallback,

        // STDERR
        function(result, data, clientCallback){
            stderr = data;
        }
    );
};

// export the class
module.exports = EstimationJobOperation;
