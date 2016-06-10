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
                thickness: 12,
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
                thickness: 12,
                mode: "gauge",
                total: 100}
            };

            $rootScope.jobs = {
                data : [{
                    label: "",
                    value: 0,
                    color: "#2361ae"
                },{
                    label: "",
                    value: 0,
                    color: "#23ae89"
                }],
                options : {
                    thickness: 12
                    }
                };

        User.get('cluster').then(
            function(data){
                $rootScope.cluster = data.cluster;

                var allocatedNode =
                    Math.round((data.cluster.statistics.nodes.allocated /
                        data.cluster.statistics.nodes.total) * 1000)/10;

                var allocatedCPUs =
                    Math.round((data.cluster.statistics.cpus.allocated /
                        data.cluster.statistics.cpus.total) * 1000)/10;

                $rootScope.nodes.data[0].value = allocatedNode;

                $rootScope.cpus.data[0].value = allocatedCPUs;

                $rootScope.jobs.data[0].value = data.cluster.statistics.jobs.pending;
                $rootScope.jobs.data[0].label = $rootScope.jobs.data[0].value + " en attente";
                $rootScope.jobs.data[1].value = data.cluster.statistics.jobs.running;
                $rootScope.jobs.data[1].label = $rootScope.jobs.data[1].value + " en cours";

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
