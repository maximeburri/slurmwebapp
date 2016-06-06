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

    partitionsListstring = result.split("\n");
    partitionsListParsed = [];

    partitionsListstring.forEach( function(partitionstring){
        partitionObject = {};
        var infos = partitionstring.match(/(\b[a-zA-Z0-9_:\/]+)=(.*?(?=\s[a-zA-Z0-9_():\-\/\*. ]+=|$|\n))/g);
        if(!infos)
            return;
        for(i=0;i<infos.length;i++){
            //infos[i] = infos[i].charAt(0).toLowerCase() + infos[i].slice(1);
            var splited = infos[i].split('=');
            if(splited.length >= 1){
                key = splited[0];
                key = key[0].toLowerCase() + key.slice(1);
                partitionObject[key] =
                    splited.length >= 2 ? splited[1] : undefined;
            }
        }
        if(partitionObject['maxTime'] != undefined){
            var maxTime = {};
            maxTime.string = partitionObject['maxTime'];
            if(maxTime.string != 'UNLIMITED'){
                var ddhh_mm_ss = maxTime.string.split(":");
                var dd_hh = ddhh_mm_ss.length > 1 ?
                                ddhh_mm_ss[0].split('-') :
                                [];

                maxTime.days = dd_hh.length > 1 ?
                                parseInt(dd_hh[0]) :
                                0;

                maxTime.hours = dd_hh.length > 1 ?
                                parseInt(dd_hh[1]) :
                                parseInt(dd_hh[0]);

                maxTime.minutes = ddhh_mm_ss.length > 2 ?
                                parseInt(ddhh_mm_ss[1]) :
                                0;

                maxTime.seconds = ddhh_mm_ss.length > 3 ?
                                parseInt(ddhh_mm_ss[2]) :
                                0;

                maxTime.timestamp =
                                maxTime.seconds +
                                maxTime.minutes * 60 +
                                maxTime.hours * 60 * 60 +
                                maxTime.days * 60 * 60 * 24;

                maxTime.unlimited = false;
            }else{
                maxTime.unlimited = true;
            }
            partitionObject['maxTime'] = maxTime;
        }
        partitionsListParsed.push(partitionObject);
    });


    clientCallback({partitions:partitionsListParsed}, false)
}



// export the class
module.exports = ListPartitionsOperation;
