/**
 * Master Controller
 */

angular.module('RDash')
    .controller('JobCtrl', ['$stateParams', '$scope', '$rootScope','$interpolate', 'User', 'Jobs', '$modal','$location', JobCtrl]);

function JobCtrl($stateParams, $scope, $rootScope, $interpolate, User, Jobs, $modal, $location) {
    $scope.job = {
        id: $stateParams.id
    }
    $rootScope.titlePage = $interpolate($rootScope.titlePage)($scope);


    $scope.cancel = function(){
        User.operation({verb:"cancel", object:"job", params:{job:{id:$scope.job.id}}}).then(
            // Success
            function(successMessage){
                console.log("Job cancelled");
            },
            // Error
            function(err){
                console.error("Job no cancelled");
            }
        );
    }
}
