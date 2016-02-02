/**
 * Master Controller
 */

angular.module('RDash')
    .controller('JobsCtrl', ['$scope', 'User', 'Jobs', '$modal', JobsCtrl]);

function JobsCtrl($scope, User, Jobs, $modal) {
    $scope.jobs = [];
    $scope.search = {}
    $scope.search.jobsOwner ="all";
    $scope.search.query = "";

    Jobs.subscribe().then(
        // Success
        function(successMessage){
            console.log("Jobs subscribe success");
            console.log(successMessage);
        },
        // Error or finish
        function(err){
            if(err != "end"){
                console.log("Jobs subscribe fail");
                console.log(err);
            }
        },
        // Progress
        function(response){
            console.log("Update jobs");
            console.log(response);
            $scope.jobs = response.jobs;
        }
    );

    $scope.$on("$destroy", function() {
        Jobs.unsubscribe();
    });

}
