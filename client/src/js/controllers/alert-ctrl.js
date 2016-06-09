/**
 * Alerts Controller
 */

angular
    .module('RDash')
    .controller('AlertsCtrl', ['$rootScope','User', AlertsCtrl]);

function AlertsCtrl($rootScope, User) {
    if(!$rootScope.cluster){
        User.get('cluster').then(
            function(data){
                $rootScope.cluster = data.cluster;
                console.log(data);
            },

            function(data){
                console.error(data);
            }
        )
    }

    $rootScope.closeAlert = function(index) {
        $rootScope.alerts.splice(index, 1);
    };
}
