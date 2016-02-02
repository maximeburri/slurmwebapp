/**
 * Master Controller
 */

angular.module('RDash')
    .controller('JobsCtrl', ['$scope', '$rootScope', 'User', 'Jobs', '$modal', JobsCtrl]);

function JobsCtrl($scope, $rootScope, User, Jobs, $modal) {
    if($rootScope.jobs == undefined){
        $rootScope.jobs = [];
        $rootScope.search = {}
        $rootScope.search.jobsOwner ="all";
        $rootScope.search.query = "";
    }

    $scope.$on("$destroy", function() {
        Jobs.unsubscribe();
    });


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
