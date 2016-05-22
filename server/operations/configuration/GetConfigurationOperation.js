var Operation = require('../Operation.js');
var shellescape = require('shell-escape');
var inherits = require('util').inherits;
var ContentFileOperation = require('../file/ContentFileOperation.js');

var config = require('../../config');

function GetConfigurationOperation() {
    Operation.call(this);
    this.token = "c9ehgK8n636zK36w";
}
inherits(GetConfigurationOperation, ContentFileOperation);

// Overwrite
GetConfigurationOperation.prototype.makeOperation =
function(client, operationInfo, clientCallback) {
    type = operationInfo.params.type;
    try{
        path = config.configuration_files.paths[type];
    }
    catch(e){
        clientCallback(null, {type:"bad_configuration_type"});
    }

    var self = this;

    // Request file size
    this.executeFilesizeRequest(client, path,
        // Error filesize
        function(exitcode){
            if(exitcode != 0)
                clientCallback({}, {type:"not_exist"});
        },
        // Filesize received
        function(filesize, path){
            if(filesize > config.configuration_files.max_filesize_transfer)
                clientCallback(null, {type:"too_big"});
            else{
                self.executeReadFileCat(client, path, function(result){
                    if(result == null)
                        clientCallback(null, {type:"bad_file"});
                    else{
                        var resultFinal = {};
                        try{
                            resultFinal = JSON.parse(result.data)
                        }catch(e){
                            console.log("Bad configuration file type")
                            console.log(e);
                        }
                        clientCallback(resultFinal);
                    }
                });
            }
        }
    );
};

// On quit nothing to do, because no tail
GetConfigurationOperation.prototype.onQuitClient =
function(client, callbackFinish) {
};


// export the class
module.exports = GetConfigurationOperation;
