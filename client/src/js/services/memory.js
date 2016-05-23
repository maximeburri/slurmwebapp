angular.module('RDash').service('Memory', [Memory]);

function Memory() {
    this.toBytes = function(number, stringUnit) {                
        factorUnit = 1;
        switch (stringUnit) {
            case "KB":
            case "Ko":
                factorUnit *= 1024;
                break;
            case "MB":
            case "Mo":
                factorUnit *= 1024^2;
                break;
            case "GB":
            case "Go":
                factorUnit *= 1024^3;
                break;
            case "TB":
            case "To":
                factorUnit *= 1024^4;
                break;
        }
        return number * factorUnit;
    };
}
