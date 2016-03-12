var Operation = require('../Operation.js');
var shellescape = require('shell-escape');
var inherits = require('util').inherits;

function ListFilesOperation() {
    Operation.call(this);
}
inherits(ListFilesOperation, Operation);

// Overwrite
ListFilesOperation.prototype.makeOperation =
function(client, operationInfo, clientCallback) {
    dir = operationInfo.params.dir;
    var cmd = shellescape(["cd", dir]) +" && "+ shellescape(["pwd"])+" && "+shellescape(["ls", "-aFH"]);
    client.executeCommand(cmd, this.parseListFiles, clientCallback);
};

// Parse liste files (ls -aF)
ListFilesOperation.prototype.parseListFiles =
function(result, exitcode, clientCallback){
    // An error has occured
    if (exitcode != 0){
        clientCallback(null, {code:exitcode, type:"ACCESS_DENIED"});
        return;
    }

    filesList = result.split("\n");
    filesList.pop(); // Remove last element
    currentPath = filesList.shift() + "/"; // Path
    //console.log("Path:"+currentPath);
    filesInfo = [];

    // Parse each file
    filesList.forEach( function(filename){
        fileType = "";
        lastChar = filename[filename.length-1];
        deleteLastChar = true;

        switch(lastChar){
            case '*':
                fileType = "executable";
                break
            case '/':
                fileType = "folder";
                break
            case '@':
                fileType = "symboliclink";
                break
            case '|':
                fileType = "FIFO";
                break
            default:
                fileType = "file";
                deleteLastChar = false;
                break
        }
        if(deleteLastChar)
            filename = filename.substring(0, filename.length-1);
        filesInfo.push({filename:filename, type:fileType});
    });

    clientCallback({path:currentPath, files:filesInfo}, false)
}



// export the class
module.exports = ListFilesOperation;
