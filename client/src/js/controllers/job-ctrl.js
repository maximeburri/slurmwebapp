/**
 * Master Controller
 */

angular.module('RDash')
    .controller('JobCtrl', ['$stateParams', '$scope', '$rootScope', '$interval', 'Files','$interpolate', 'User', JobCtrl]);

function JobCtrl($stateParams, $scope, $rootScope, $interval, Files, $interpolate, User) {
    $scope.job = {
        id: $stateParams.id
    }
    $rootScope.titlePage = $interpolate($rootScope.titlePage)($scope);

    $scope.fileStdOut = {
        content : "",
        modified : false,
        not_exist : false,
        promise : false
    };

    $scope.fileStdErr = {
        content : "",
        modified : false,
        not_exist : false,
        promise : false
    };

    firstActualisation = true;
    updateInterval = undefined;


    $scope.cancel = function(){
        User.operation({verb:"cancel", object:"job", params:{job:{id:$scope.job.id}}}).then(
            // Success
            function(successMessage){
                console.log("Job cancelled");
                $scope.update();
            },
            // Error
            function(err){
                console.error("Job no cancelled");
                $scope.update();
            }
        );
    }

    $scope.update = function(){
        User.operation({verb:"detail", object:"job", params:{job:{id:$scope.job.id}}}).then(
            // Success
            function(data){
                $scope.job = data.job;
                $scope.job.id = $scope.job.jobId;
                console.log($scope.job);

                if(firstActualisation){
                    firstActualisation = false;
                    $scope.viewFile($scope.job.stdOut, $scope.fileStdOut);
                    $scope.viewFile($scope.job.stdErr, $scope.fileStdErr);
                }

                if($scope.job.jobState == "COMPLETED"){
                    $interval.cancel(updateInterval);
                    updateInterval = undefined;
                }

            },
            // Error
            function(err){
                console.error("Detail job failed");
                console.error(err);
            }
        );
    }

    $scope.viewFile = function(filePath, file){
        file.content = "";
        file.modified = false;
        file.promise = Files.getFileContent(filePath, true);
        file.not_exist = false;
        file.too_big = false;
        file.promise.then(
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
                    file.not_exist = true;
                }else if(err.type == "too_big"){
                    file.too_big = true;
                }else{
                    file.modified = true;
                }
                $scope.stopFollowFileContent(file);
            },
            // Progress
            function(notificationMessage){
                console.log("Notification");
                console.log(notificationMessage);
                file.content += notificationMessage.data;
            }
        );
    }

    $scope.stopFollowFileContent = function(file){
        if(file.promise){
            file.promise.stop();
            delete file.promise;
            file.promise = false;
        }
    }

    $scope.endUpdate = function(){
        $scope.stopFollowFileContent($scope.fileStdOut);
        $scope.stopFollowFileContent($scope.fileStdErr);
        $interval.cancel(updateInterval);
        updateInterval = undefined;

    }

    $scope.$on("$destroy", $scope.endUpdate);

    $scope.update();
    updateInterval = $interval(function() {
        $scope.update()
    }, 5000);
}
