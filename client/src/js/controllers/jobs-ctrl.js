/**
 * Master Controller
 */

angular.module('RDash')
    .controller('JobsCtrl', ['$scope', 'User', 'Jobs', '$modal', JobsCtrl]);

function JobsCtrl($scope, User, Files, $modal) {
    $scope.jobs = [];
    $scope.jobs = [
        {
            id:"11223",
            name:"2py-2h2o",
            user:"dogga",
            partition:"shared",
            remainingTime:"6.2 hours",
            nbCPU:16,
            nodes:"node058"
        },
        {
            id:"11224",
            name:"asd",
            user:"burrimax",
            partition:"shared",
            remainingTime:"6.2 hours",
            nbCPU:16,
            nodes:"node058"
        },
        {
            id:"11225",
            name:"Nom 2",
            user:"burrimax",
            partition:"share",
            remainingTime:"6.2 hours",
            nbCPU:16,
            nodes:"node058"
        }
    ];
    $scope.search = {}
    $scope.search.jobsOwner ="my";
    $scope.search.query = "";

}
