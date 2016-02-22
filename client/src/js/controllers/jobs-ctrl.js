/**
 * Master Controller
 */

angular.module('RDash')
    .controller('JobsCtrl', ['$scope', '$rootScope', 'User', 'Jobs', '$modal','$location', '$interval', JobsCtrl]);

function JobsCtrl($scope, $rootScope, User, Jobs, $modal, $location, $interval) {

    $interval(function(){
        $rootScope.timestamp = Math.round((new Date()).getTime()/1000);
    }, 1000);

    if($rootScope.jobs == undefined){
        $rootScope.jobs = [];
        $rootScope.search = {}
        $rootScope.search.jobsOwner ="my";
        $rootScope.search.jobsType = "all";
        $rootScope.search.query = "";
    }

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
            $rootScope.jobs = response.jobs;
        }
    );

}
