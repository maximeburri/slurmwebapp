/**
 * Alerts Controller
 */

angular
    .module('RDash')
    .controller('AlertsCtrl', ['$rootScope', AlertsCtrl]);

function AlertsCtrl($rootScope) {

    $rootScope.addAlert = function() {
        $rootScope.alerts.push({
            msg: 'Another alert!'
        });
    };

    $rootScope.closeAlert = function(index) {
        $rootScope.alerts.splice(index, 1);
    };
}
