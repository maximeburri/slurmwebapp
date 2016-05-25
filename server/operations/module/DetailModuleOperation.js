var Operation = require('../Operation.js');
var shellescape = require('shell-escape');
var inherits = require('util').inherits;

function DetailModuleOperation() {
    Operation.call(this);
}
inherits(DetailModuleOperation, Operation);

// Overwrite
DetailModuleOperation.prototype.makeOperation =
function(client, operationInfo, clientCallback) {
    var moduleName = undefined;

    if(operationInfo.params)
        moduleName = operationInfo.params.moduleName;

    if(!moduleName){
        clientCallback(null, {type:"MODULE_NOT_SPECIFIED"});
        return;
    }

    var cmd = shellescape(['module', 'spider', moduleName]) +
        " 2>&1 >/dev/null | awk '/You will/,/Help/' ; test ${PIPESTATUS[0]} -eq 0";
    var self = this;

    client.executeCommand(
        cmd,
        self.parseSpider,
        clientCallback,
        // STDERR
        function(result, data, clientCallback){

        }
    );
};

// Parse liste files (ls -aF)
DetailModuleOperation.prototype.parseSpider =
function(result, exitcode, clientCallback){
    // An error has occured
    if (exitcode != 0){
        clientCallback(null, {code:exitcode, type:"MODULE_UNVAILIBLE"});
        return;
    }

    lines = result.split("\n");
    dependencies = [];

    for(i = 2;i<lines.length-3;i++){
        var line = lines[i];

        // Remove tabulation and space
        for(j = 0;j<line.length;j++){
            if(line[j] != '\t' && line[j] != ' ')
                break;
        }
        line = line.slice(j);

        // Remove double space
        line = line.replace('  ', ' ');

        dependencies.push(line);
    }

    clientCallback({dependencies:dependencies}, false)
}



// export the class
module.exports = DetailModuleOperation;
