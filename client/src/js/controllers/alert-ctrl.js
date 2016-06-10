/**
 * Alerts Controller
 */

angular
    .module('RDash')
    .controller('AlertsCtrl', ['$rootScope','User', AlertsCtrl]);

function AlertsCtrl($rootScope, User) {
    if(!$rootScope.cluster){
        $rootScope.nodes = {
            data : [{
                label:"noeuds utilisés",
                value:0,
                color: "#ae2323",
                suffix:'%'
            }],
            options : {
                thickness: 5,
                mode: "gauge",
                total: 100}
            };
        $rootScope.cpus = {
            data : [{
                label: "CPUs utilisés",
                value: 0,
                color: "#d3a938",
                suffix: '%'
            }],
            options : {
                thickness: 5,
                mode: "gauge",
                total: 100}
            };

        User.get('cluster').then(
            function(data){
                $rootScope.cluster = data.cluster;

                var allocatedNode =
                    Math.round((data.cluster.statistics.total.nodes.allocated /
                        data.cluster.statistics.total.nodes.total) * 1000)/10;

                var allocatedCPUs =
                    Math.round((data.cluster.statistics.total.cpus.allocated /
                        data.cluster.statistics.total.cpus.total) * 1000)/10;

                $rootScope.nodes.data[0].value = allocatedNode;

                $rootScope.cpus.data[0].value = allocatedCPUs;


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
