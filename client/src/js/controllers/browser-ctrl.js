/**
 * Master Controller
 */

angular.module('RDash')
    .controller('BrowserCtrl', ['$scope', 'User', 'Files', '$modal', BrowserCtrl]);

function BrowserCtrl($scope, User, Files, $modal) {
    $scope.fileViewer = {
        content : "",
        filepath : "",
        modified : false,
        not_exist : false,
        show : false
    };
    $scope.files = [];
    $scope.currentDir = ".";
    $scope.loading = false;
    promiseSocketContentFile = false;
    var scope = $scope;
    var that = this;

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
            }
        );
    }

    $scope.goToFile = function(file){
        $scope.stopFollowFileContent();
        futurDir = $scope.currentDir + file.filename;
        console.log("Go to:"+futurDir);

        if(file.type == "folder" || file.type == "symboliclink"){
            $scope.fileViewer.show = false;
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
            $scope.viewFile(futurDir);
        }
    }

    $scope.actualiseListFiles = function(){
        $scope.goToFile({filename:'.', type:'folder'});
    }

    $scope.goToParentFolder = function(){
        $scope.goToFile({filename:"..", type:"folder"});
    }

    $scope.stopFollowFileContent = function(){
        if(promiseSocketContentFile){
            promiseSocketContentFile.stop();
            delete promiseSocketContentFile;
            promiseSocketContentFile = false;
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

    $scope.viewFileRefresh = function(){
        $scope.stopFollowFileContent();
        $scope.viewFile($scope.fileViewer.filepath);
    }

    $scope.viewFile = function(filePath){
        $scope.fileViewer.content = "";
        $scope.fileViewer.modified = false;
        $scope.fileViewer.filepath = filePath;
        promiseSocketContentFile = Files.getFileContent(filePath, true);
        $scope.fileViewer.show = true;
        $scope.fileViewer.not_exist = false;
        $scope.fileViewer.too_big = false;
        promiseSocketContentFile.then(
            // Success
            function(successMessage){
                console.log("Success");
                console.log(successMessage);
            },
            // Error
            function(err){
                console.log("Fail");
                console.log(err);
                if(err.type == "not_exist"){
                    $scope.fileViewer.not_exist = true;
                }else if(err.type == "too_big"){
                    $scope.fileViewer.too_big = true;
                }else{
                    $scope.fileViewer.modified = true;
                }
                $scope.stopFollowFileContent();
            },
            // Progress
            function(notificationMessage){
                console.log("Notification");
                console.log(notificationMessage);
                $scope.fileViewer.content += notificationMessage.data;
            }
        );
    }

    $scope.updateFiles($scope.currentDir);


}
