/**
 * Master Controller
 */

angular.module('RDash')
    .controller('BrowserCtrl', ['$scope', 'User', 'Files', '$modal', BrowserCtrl]);

function BrowserCtrl($scope, User, Files, $modal) {
    $scope.fileView = {
        content : "",
        filename : "",
        show : false
    };
    $scope.files = [];
    $scope.currentDir = ".";
    $scope.loading = false;
    promiseSocketContentFile = false;
    var scope = $scope;
    var that = this;
    setTimeout(function(){

    }, 3000);

    $scope.updateFiles = function(dir){
        $scope.loading = true;
        return Files.getListFiles(dir).then(
            // Success
            function(data){
                $scope.currentDir = data.path;
                $scope.files = data.files;
                console.log("Operation effectued");
                console.log(JSON.stringify(data));
                $scope.loading = false;
            }/*,
            // Error
            function(err){
                $scope.modalError = {};
                $scope.modalError.message = "Impossible d'accéder à " + dir;
                var modalInstance = $modal.open({
                    animation: true,
                    templateUrl: 'templates/modal/simpleError.html',
                    scope:$scope
                });
                $scope.loading = false;
            }*/
        );
    }

    $scope.goToFile = function(file){
        $scope.stopFollowFileContent();
        futurDir = $scope.currentDir + file.filename;
        console.log("Go to:"+futurDir);

        if(file.type == "folder" || file.type == "symboliclink"){
            $scope.fileView.show = false;
            $scope.updateFiles(futurDir).catch(
                function(err){
                    console.log(err);
                    $scope.loading = false;
                    if(err.type == "ACCESS_DENIED"){
                        $scope.showAlertAccessFailed(futurDir);
                    }else{
                        console.error("Unknow error");
                        console.error(err);
                    }

                }
            );
        }else{
            $scope.fileView.filename = futurDir;
            promiseSocketContentFile = Files.getFileContent(futurDir, true);
            $scope.fileView.show = true;
            promiseSocketContentFile.then(
                // Success
                function(successMessage){
                    console.log("Success");
                    console.log(successMessage);
                },
                // Error
                function(failMessage){
                    console.log("Fail");
                    console.log(failMessage);
                },
                // Progress
                function(notificationMessage){
                    console.log("Notification");
                    console.log(notificationMessage);
                    $scope.fileView.content += notificationMessage.data;
                }
            );
        }
    }

    $scope.goToParentFolder = function(){
        $scope.goToFile({filename:"..", type:"folder"});
    }

    $scope.stopFollowFileContent = function(){
        if(promiseSocketContentFile){
            promiseSocketContentFile.stop();
            delete promiseSocketContentFile;
            promiseSocketContentFile = false;
            $scope.fileView.content = "";
        }
    }

    $scope.showAlertAccessFailed = function(dirFailed){
        $scope.modalError = {};
        $scope.modalError.message = "Impossible d'accéder à " + dirFailed;
        var modalInstance = $modal.open({
            animation: true,
            templateUrl: 'templates/modal/simpleError.html',
            scope:$scope
        });
    }

    $scope.updateFiles($scope.currentDir);


}
