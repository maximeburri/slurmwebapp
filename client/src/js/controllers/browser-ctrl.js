/**
 * Master Controller
 */

angular.module('RDash')
    .controller('BrowserCtrl', ['$scope', 'User', BrowserCtrl]);

function BrowserCtrl($scope, User) {
    $scope.files = [];
    $scope.currentDir = ".";
    var scope = $scope;
    var that = this;

    $scope.updateFiles = function(dir){
        User.get("files", {dir:dir}, function(data, errorcode){
            $scope.currentDir = data.path;
            $scope.files = data.files;
            console.log("Operation effectued");
            console.log(JSON.stringify(data));
            console.log(errorcode);
            $scope.$apply();
        });
    }

    $scope.goToFile = function(filename){
        console.log("Go to:"+$scope.currentDir + "/" + filename)
        $scope.updateFiles($scope.currentDir + "/" + filename);
    }

    $scope.updateFiles($scope.currentDir);

}
