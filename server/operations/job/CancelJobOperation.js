var Operation = require('../Operation.js');
var shellescape = require('shell-escape');
var inherits = require('util').inherits;

function CancelJobOperation() {
    Operation.call(this);
}
inherits(CancelJobOperation, Operation);

// Overwrite
CancelJobOperation.prototype.makeOperation =
function(client, operationInfo, clientCallback) {
    //console.log(client);
    client.executeCommand(shellescape(["scancel", operationInfo.params.job.id]),
    function(result, exitcode, clientCallback){
        if(exitcode != 0){
            clientCallback(null, {error:"CANCEL_FAIL"});
        }else{
            clientCallback({success:true}, false);
        }
    }, clientCallback);
};



// export the class
module.exports = CancelJobOperation;
