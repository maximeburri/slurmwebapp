var Operation = require('../Operation.js');
var shellescape = require('shell-escape');
var inherits = require('util').inherits;

function ListPartitionsOperation() {
    Operation.call(this);
}
inherits(ListPartitionsOperation, Operation);

// Overwrite
ListPartitionsOperation.prototype.makeOperation =
function(client, operationInfo, clientCallback) {
    var cmd = "scontrol show partition -o";
    client.executeCommand(cmd, this.parseListPartitions, clientCallback);
};

// Parse liste files (ls -aF)
ListPartitionsOperation.prototype.parseListPartitions =
function(result, exitcode, clientCallback){
    // An error has occured
    if (exitcode != 0){
        clientCallback(null, {code:exitcode, type:"ACCESS_DENIED"});
        return;
    }

    partitionsListString = result.split("\n");
    partitionsListParsed = {};

    partitionsListString.forEach( function(partitionString){
        partitionObject = {};
        var infos = partitionString.match(/(\b[a-zA-Z0-9_:\/]+)=(.*?(?=\s[a-zA-Z0-9_():\-\/\*. ]+=|$|\n))/g);
        if(!infos)
            return;
        for(i=0;i<infos.length;i++){
            //infos[i] = infos[i].charAt(0).toLowerCase() + infos[i].slice(1);
            var splited = infos[i].split('=');
            if(splited.length >= 1){
                partitionObject[splited[0]] =
                    splited.length >= 2 ? splited[1] : undefined;
            }
        }
        console.log(infos);

        partitionsListParsed[partitionObject['PartitionName']] = partitionObject;
    });



    clientCallback({partitions:partitionsListParsed}, false)
}



// export the class
module.exports = ListPartitionsOperation;
