/**
 * Master Controller
 */

angular.module('RDash')
    .controller('JobsCtrl', ['$scope', '$rootScope', 'User', 'Jobs', '$modal','$location', '$interval', JobsCtrl]);

function JobsCtrl($scope, $rootScope, User, Jobs, $modal, $location, $interval) {
    $scope.jobs = [];
    $scope.search = {}
    $scope.search.jobsOwner ="my";
    $scope.search.jobsType = "all";
    $scope.search.query = "";


    $interval(function(){
        $rootScope.timestamp = Math.round((new Date()).getTime()/1000);
    }, 1000);

    $scope.$on("$destroy", function() {
        Jobs.unsubscribe();
    });

    $scope.goToJob = function(job){
        $location.path( "/job/"+job.id );
    }

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

}
