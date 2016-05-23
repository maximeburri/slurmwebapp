angular.module('RDash').service('Memory', [Memory]);

function Memory() {
    this.units = [
        ["o", "B", "octets", "bytes"],
        ["Ko", "KB"],
        ["Mo", "MB"],
        ["Go", "GB"],
        ["To", "TB"],
    ];
    this.base = 1024;
    var self = this;

    this.toBytes = function(number, stringUnit) {
        factorUnit = 1;
        for(i = 0;i<self.units.length;i++){
            for(j = 0;j<self.units[i].length;j++){
                if(stringUnit == self.units[i][j])
                    return number * Math.pow(self.base, i);
            }
        }

        return number;
    };
}
