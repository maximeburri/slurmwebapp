/**
 * Loading Directive
 * @see http://tobiasahlin.com/spinkit/
 */

angular
    .module('RDash')
    .directive('swaLoading', swaLoading);

function swaLoading() {
    var directive = {
        restrict: 'E',
        transclude : true,
        scope : {
            states:'=?',
            stateName:'@?',
            size:'@?',
            showSuccessCheck:'@?',
            stateInit:'@?',
            style:'@?'
        },
        templateUrl : 'templates/loading.html',
        link: function(scope, element, attrs){
            if(scope.states == undefined)
                scope.states = {};

            if(scope.states[scope.stateName] == undefined)
                scope.states[scope.stateName] = "loading";

            if(scope.stateInit != undefined)
                scope.states[scope.stateName] = scope.stateInit;

            if(scope.showSuccessCheck == undefined)
                scope.showSuccessCheck = false;

            if(scope.style == undefined)
                scope.style = "";

            if(scope.size == undefined)
                scope.size = "auto";
        }
    };
    return directive;
};
