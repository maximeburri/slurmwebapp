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
        if(partitionObject['MaxTime'] != undefined){
            var MaxTime = {};
            MaxTime.String = partitionObject['MaxTime'];
            if(MaxTime.String != 'UNLIMITED'){
                var ddhh_mm_ss = MaxTime.String.split(":");
                var dd_hh = ddhh_mm_ss.length > 1 ?
                                ddhh_mm_ss[0].split('-') :
                                [];

                MaxTime.Days = dd_hh.length > 1 ?
                                parseInt(dd_hh[0]) :
                                0;

                MaxTime.Hours = dd_hh.length > 1 ?
                                parseInt(dd_hh[1]) :
                                parseInt(dd_hh[0]);

                MaxTime.Minutes = ddhh_mm_ss.length > 2 ?
                                parseInt(ddhh_mm_ss[1]) :
                                0;

                MaxTime.Seconds = ddhh_mm_ss.length > 3 ?
                                parseInt(ddhh_mm_ss[2]) :
                                0;

                MaxTime.Timestamp =
                                MaxTime.Seconds +
                                MaxTime.Minutes * 60 +
                                MaxTime.Hours * 60 * 60 +
                                MaxTime.Days * 60 * 60 * 24;

                MaxTime.Unlimited = false;
            }else{
                MaxTime.Unlimited = true;
            }
            partitionObject['MaxTime'] = MaxTime;
        }
        partitionsListParsed[partitionObject['PartitionName']] = partitionObject;
    });



    clientCallback({partitions:partitionsListParsed}, false)
}



// export the class
module.exports = ListPartitionsOperation;
