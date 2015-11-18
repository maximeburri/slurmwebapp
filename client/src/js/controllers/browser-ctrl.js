/**
 * Master Controller
 */

angular.module('RDash')
    .controller('BrowserCtrl', ['$scope', 'User', BrowserCtrl]);

function BrowserCtrl($scope, User) {
    $scope.files = [];
    currentDir = "~";
    var scope = $scope;
    var that = this;

    $scope.updateFiles = function(dir){
        User.get("files", {dir:dir}, function(data, errorcode){
            that.currentDir = dir;
            $scope.files = data;
            console.log("Operation effectued");
            console.log(JSON.stringify(data));
            console.log(errorcode);
            $scope.$apply();
        });
    }

    $scope.goToFile = function(filename){
        console.log("Go to:"+that.currentDir + "/" + filename)
        $scope.updateFiles(that.currentDir + "/" + filename);
    }

    $scope.updateFiles(currentDir);

}
