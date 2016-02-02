/**
 * Loading Directive
 * @see http://tobiasahlin.com/spinkit/
 */

angular
    .module('RDash')
    .directive('swaJobState', ['Jobs', swaJobState]);

function swaJobState(Jobs) {
    var directive = {
        restrict: 'AE',
        scope: {state: '@', description:'@', reason:'@'},
        template: '<i class="fa fa-{{icon.name}}" style="color:{{icon.color}};margin:5px;font-size: 18px!important;" tooltip="{{tooltip}}" tooltip-placement="top"> </i> ',
        link: function (scope, element, attrs) {
            scope.icon = Jobs.jobStateCodes[scope.state].icon;
            scope.tooltip = Jobs.jobStateCodes[scope.state].completeName ;
            if(scope.description)
                scope.tooltip += " : " + Jobs.jobStateCodes[scope.state].description;
            /*if(scope.reason)
                scope.tooltip += ", raison : " + scope.reason;*/
        }
    };
    return directive;
};
