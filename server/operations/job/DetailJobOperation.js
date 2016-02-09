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
    //console.log(client);
    client.executeCommand(shellescape(["scontrol", "show", "job",
        operationInfo.params.job.id, "-dd"]),
        function(result, exitcode, clientCallback){
            if(exitcode != 0){
                clientCallback(null, {error:"DETAIL_JOB_FAILED"});
            }
            // No error parse
            else{
                // source de base : http://stackoverflow.com/a/28131137/3139417
                var infos = result.match(/(\b[a-zA-Z0-9_:\/]+)=(.*?(?=\s[a-zA-Z0-9_():\-\/\*. ]+=|$|\n))/g);
                var job = {};

                // Split all lines
                for(var i = 0; i < infos.length; i++) {
                    arrayKey = infos[i].split("=");
                    key = arrayKey[0];
                    key = key[0].toLowerCase() + key.slice(1);
                    key = key.replace(/([\/ :])/g, '');
                    value = arrayKey[1];
                    job[key] = value;
                }
                // Remove parenthesis in userName field
                userNameId = job.userId.split("(");
                job.userNameId = job.userId;
                job.userName = userNameId[0];
                job.userId = userNameId[1].slice(0, -1); // Remove ')'

                clientCallback({job:job}, false);
            }
        }, clientCallback);
};



// export the class
module.exports = DetailJobOperation;
