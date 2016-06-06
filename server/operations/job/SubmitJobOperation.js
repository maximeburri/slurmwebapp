var Operation = require('../Operation.js');
var shellescape = require('shell-escape');
var inherits = require('util').inherits;

function SubmitJobOperation() {
    Operation.call(this);
}
inherits(SubmitJobOperation, Operation);

// Overwrite
SubmitJobOperation.prototype.makeOperation =
function(client, operationInfo, clientCallback) {
    scriptPath = operationInfo.params.scriptPath;

    client.executeCommand(
        shellescape(["chmod", "+x", scriptPath]) + " && " +
        shellescape(["sbatch", "--parsable", scriptPath]),
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
