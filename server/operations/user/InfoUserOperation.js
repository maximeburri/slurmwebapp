var Operation = require('../Operation.js');
var shellescape = require('shell-escape');
var inherits = require('util').inherits;

function DetailJobOperation() {
    Operation.call(this);
}
inherits(DetailJobOperation, Operation);

// Overwrite
DetailJobOperation.prototype.makeOperation =
function(client, operationInfo, clientCallback) {
    username = "";
    if(operationInfo.params && operationInfo.params.username)
        username = operationInfo.params.username;
    else
        username = client.params.username;

    /*de 2 à end*/
    client.executeCommand(shellescape(["groups", username]),
        function(result, exitcode, clientCallback){
            if(exitcode != 0){
                clientCallback(null, {error:"INFO_USER_FAIL"});
            }
            // No error parse
            else{
                lines = result.split('\n');
                groups : [];
                username : "";
                if(lines.length > 0){
                    splitted = lines[0].split(' ');
                    if(splitted.length > 0 ){
                        username = splitted[0];
                    }
                    if(splitted.length){
                        groups = splitted.splice(2);
                    }
                }
                clientCallback({user:{groups:groups, username:username}});
            }
        }, clientCallback);
};



// export the class
module.exports = DetailJobOperation;
