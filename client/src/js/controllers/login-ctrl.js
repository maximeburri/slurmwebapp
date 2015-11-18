/**
 * Master Controller
 */

angular.module('RDash')
    .controller('LoginCtrl', ['$scope', '$location', '$cookieStore', 'User', LoginCtrl]);

function LoginCtrl($scope, $location, $cookieStore, User) {
    var scope = $scope;
    $scope.connectionProcessing = User.connectionProcessing;
    $scope.connected = User.connected;

    // Default input
    $scope.user = {
        username : "",
        password : "",
        cluster  : "",
        bridge   : ""
    };

    $scope.login = function() {
        scope.connectionProcessing = true;
        User.connect($scope.user, $scope.connectedChanged, $scope.connectProcessingChanged);
    };

    $scope.connectedChanged = function(connected) {
        if(connected){
            console.log(connected);
            $scope.$apply(function() {
                $location.path('/dashboard');
            });
        }
        //scope.$apply(function() {
        //    scope.connected = connected;
        //});
    }

    $scope.connectProcessingChanged = function(connectProcessing) {
        //alert("connectProcessing: " +connectProcessing);
        //scope.$apply(function() {
        //    scope.connectionProcessing = connectProcessing;
        //});
        //scope.$apply();
    }

    /*$scope.$watch( function() {return User.connectionProcessing;},
        function (newValue) {
            $scope.connectionProcessing = newValue;
            alert("connectionProcessing changed to " + newValue);
        }, true);

    $scope.$watch( function(){return User.connected;},
        function (newValue) {
            $scope.connectionProcecssing = newValue;
            alert("connected changed to " + newValue);
        }, true);*/

};
