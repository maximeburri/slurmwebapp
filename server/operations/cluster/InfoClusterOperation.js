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
    cmd = "sinfo --format=\"%R|%C|%F\" --noheader";

    // Parse A/I/O/T
    parseAIOT = function(str){
        obj = {
            allocated : 0,
            idle : 0,
            other : 0,
            total : 0
        }
        if(str){
            infos = str.split('/');
            obj.allocated = parseInt(infos[0]);
            obj.idle = parseInt(infos[1]);
            obj.other = parseInt(infos[2]);
            obj.total = parseInt(infos[3]);
        }
        return obj;
    }

    // Add A/I/O/T
    addAIOT = function(obj1, obj2){
        obj1.allocated += obj2.allocated;
        obj1.idle += obj2.idle;
        obj1.other += obj2.other;
        obj1.total += obj2.total;
    }

    client.executeCommand(cmd,
        function(result, exitcode, clientCallback){
            if(exitcode != 0){
                clientCallback(null, {error:"INFO_CLUSTER_FAIL"});
            }
            // No error parse
            else{
                // Final result
                cluster = {
                    statistics : {
                        partitions : [],
                        total : {
                            cpus : parseAIOT(),
                            nodes : parseAIOT()
                        }
                    }
                };
                lines = result.split('\n');

                // Foreach partitions
                for(i = 0;i<lines.length;i++){
                    infos = lines[i].split('|');
                    partition = {
                        name : infos[0],
                        cpus : parseAIOT(infos[1]),
                        nodes : parseAIOT(infos[2])
                    };

                    // Add to partitions
                    cluster.statistics.partitions.push(partition);

                    // Add to total
                    addAIOT(cluster.statistics.total.cpus, partition.cpus);
                    addAIOT(cluster.statistics.total.nodes, partition.nodes);
                }

                clientCallback({cluster:cluster});
            }
        }, clientCallback);
};



// export the class
module.exports = DetailJobOperation;
