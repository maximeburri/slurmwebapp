/**
 * Master Controller
 */

angular.module('RDash')
    .controller('JobCtrl', ['$scope', '$rootScope', 'User', 'Jobs', '$modal','$location', JobCtrl]);

function JobCtrl($scope, $rootScope, User, Jobs, $modal, $location) {
    $rootScope.titlePage = "Job : <nom du job>";
}
