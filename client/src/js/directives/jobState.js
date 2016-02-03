/**
 * Loading Directive
 * @see http://tobiasahlin.com/spinkit/
 */

angular
    .module('RDash')
    .directive('swaJobState', ['Jobs','$compile', swaJobState]);

function swaJobState(Jobs, $compile) {
    var directive = {
        restrict: 'AE',
        scope: {state: '@', description:'@', reason:'@'},
        template: '<i class="fa fa-{{icon.name}} {{icon.class}}" style="margin:5px;font-size: 18px!important;" tooltip="{{tooltip}}" tooltip-placement="top"> </i> ',
        link: function (scope, element, attrs) {
            update = function(){
                if(Jobs.jobStateCodes[scope.state]){
                    scope.icon = Jobs.jobStateCodes[scope.state].icon;
                    scope.tooltip = Jobs.jobStateCodes[scope.state].completeName ;
                    if(scope.description)
                        scope.tooltip += " : " + Jobs.jobStateCodes[scope.state].description;
                    /*if(scope.reason)
                        scope.tooltip += ", raison : " + scope.reason;*/
                }
            }
            scope.$watch('state', update);
        }
    };
    return directive;
};
