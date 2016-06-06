var Operation = require('../Operation.js');
var shellescape = require('shell-escape');
var inherits = require('util').inherits;
var path = require('path');

function SubmitJobOperation() {
    Operation.call(this);
}
inherits(SubmitJobOperation, Operation);

// Overwrite
SubmitJobOperation.prototype.makeOperation =
function(client, operationInfo, clientCallback) {
    scriptPath = operationInfo.params.scriptPath;
    scriptDirname = path.dirname(scriptPath);
    scriptBasename = path.basename(scriptPath);

    client.executeCommand(
        shellescape(["cd", scriptDirname]) + " && " +
        shellescape(["chmod", "+x", scriptBasename]) + " && " +
        shellescape(["sbatch", "--parsable", scriptBasename]),
        function(result, exitcode, clientCallback){
            if(exitcode != 0){
                clientCallback(null, {error:"SUBMIT_FAIL"});
            }else{
                // Parse the job id
                id = null;
                words = result.split(';');
                // Get id (first with --parsable)
                try{
                    id = parseInt(words[0]);
                }catch(e){
                    id = null;
                }

                clientCallback({id:id}, false);
            }
        }, clientCallback
    );
};



// export the class
module.exports = SubmitJobOperation;
