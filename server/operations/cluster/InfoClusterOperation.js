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
    cmd = 'sinfo --format="%N|%R|%C|%F" --Node -a -h';

    // Parse A/I/O/T
    parseAIOT = function(str){
        var obj = {
            allocated : 0,
            idle : 0,
            other : 0,
            total : 0
        };
        if(str){
            var infos = str.split('/');
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
                partitionsByName = {};

                // Final result
                cluster = {
                    statistics : {
                        nodes : [],
                        total : {
                            cpus : parseAIOT(),
                            nodes : parseAIOT()
                        }
                    }
                };
                lines = result.split('\n');

                // Foreach nodes
                for(i = 0;i<lines.length-1;i++){
                    infos = lines[i].split('|');
                    node = {
                        name : infos[0],
                        // Only partition... Why ??
                        // Maybe the main
                        partition : infos[1],
                        cpus : parseAIOT(infos[2]),
                        aoit : parseAIOT(infos[3])
                    };

                    // Add to nodes
                    cluster.statistics.nodes.push(node);

                    // Add to total
                    addAIOT(cluster.statistics.total.cpus, node.cpus);
                    addAIOT(cluster.statistics.total.nodes, node.aoit);

                    if(!partitionsByName[node.partition]){
                        partitionsByName[node.partition] = true;
                    }
                }
                cluster.partitions = Object.keys(partitionsByName);
                clientCallback({cluster:cluster});
            }
        }, clientCallback);
};



// export the class
module.exports = DetailJobOperation;
