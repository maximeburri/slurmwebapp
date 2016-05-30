var Operation = require('../Operation.js');
var shellescape = require('shell-escape');
var inherits = require('util').inherits;

function ListLicensesOperation() {
    Operation.call(this);
}
inherits(ListLicensesOperation, Operation);

// Overwrite
ListLicensesOperation.prototype.makeOperation =
function(client, operationInfo, clientCallback) {
    var cmd = "scontrol show lic -o";
    client.executeCommand(cmd, this.parseListLicenses, clientCallback);
};

// Parse liste files (ls -aF)
ListLicensesOperation.prototype.parseListLicenses =
function(result, exitcode, clientCallback){
    // An error has occured
    if (exitcode != 0){
        clientCallback(null, {code:exitcode, type:"ACCESS_DENIED"});
        return;
    }

    licensesListString = result.split("\n");
    licensesListParsed = [];

    licensesListString.forEach( function(licenseString){
        licenseObject = {};
        var infos = licenseString.match(/(\b[a-zA-Z0-9_:\/]+)=(.*?(?=\s[a-zA-Z0-9_():\-\/\*. ]+=|$|\n))/g);
        if(!infos)
            return;
        for(i=0;i<infos.length;i++){
            var splited = infos[i].split('=');
            if(splited.length >= 1){
                key = splited[0];
                key = key[0].toLowerCase() + key.slice(1);
                licenseObject[key] =
                    splited.length >= 2 ? splited[1] : undefined;
            }
        }

        shortName = licenseObject['licenseName'] ? licenseObject['licenseName'].split('@') : '';
        if(shortName && shortName.length >= 1 )
            shortName = shortName[0];

        licenseObject.shortName = shortName;
        licensesListParsed.push(licenseObject);
    });

    clientCallback({licenses:licensesListParsed}, false)
}



// export the class
module.exports = ListLicensesOperation;
