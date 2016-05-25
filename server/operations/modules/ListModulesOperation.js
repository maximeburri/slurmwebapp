var Operation = require('../Operation.js');
var shellescape = require('shell-escape');
var inherits = require('util').inherits;

function ListModulesOperation() {
    Operation.call(this);
}
inherits(ListModulesOperation, Operation);

// Overwrite
ListModulesOperation.prototype.makeOperation =
function(client, operationInfo, clientCallback) {
    var cmd = "module --terse spider";
    var resultStderr = ""; // Result in stderr
    var self = this;

    client.executeCommand(
        cmd,
        function(result, exitcode, clientCallback){
            self.parseListModules(resultStderr, exitcode, clientCallback);
        },
        clientCallback,
        // STDERR
        function(result, data, clientCallback){
            resultStderr += data;
        }
    );
};

// Parse liste files (ls -aF)
ListModulesOperation.prototype.parseListModules =
function(result, exitcode, clientCallback){
    // An error has occured
    if (exitcode != 0){
        clientCallback(null, {code:exitcode, type:"ACCESS_DENIED"});
        return;
    }

    modulesListString = result.split("\n");
    modulesListParsed = [];
    version = false;

    for(i = 0;i<modulesListString.length-1;i++){
        line = modulesListString[i];

        if(line.length>0 &&
            (line[line.length-1] == '/' || line.includes('Rebuilding cache'))){
                continue;
        }else{
            if(line.length > 1 && line[line.length - 1] != '/')
                modulesListParsed.push(line);
        }
    }

    clientCallback({modules:modulesListParsed}, false)
}



// export the class
module.exports = ListModulesOperation;
