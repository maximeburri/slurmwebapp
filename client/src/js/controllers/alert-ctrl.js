/**
 * Alerts Controller
 */

angular
    .module('RDash')
    .controller('AlertsCtrl', ['$rootScope','User', AlertsCtrl]);

function AlertsCtrl($rootScope, User) {
    if(!$rootScope.cluster){
        $rootScope.nodes = {data:{}, options:{}};
        $rootScope.cpus = {data:{}, options:{}};

        User.get('cluster').then(
            function(data){
                $rootScope.cluster = data.cluster;

                var allocatedNode =
                    Math.round((data.cluster.statistics.total.nodes.allocated /
                        data.cluster.statistics.total.nodes.total) * 1000)/10;

                var allocatedCPUs =
                    Math.round((data.cluster.statistics.total.cpus.allocated /
                        data.cluster.statistics.total.cpus.total) * 1000)/10;

                $rootScope.nodes.options = {thickness: 5, mode: "gauge",
                    total: 100};
                $rootScope.nodes.data = [
                  {label: "noeuds utilisés", value:allocatedNode, color: "#ae2323", suffix:'%'},
                ];

                $rootScope.cpus.options = {thickness: 5, mode: "gauge",
                    total: 100};
                $rootScope.cpus.data = [
                  {label: "CPUs utilisés", value:allocatedCPUs, color: "#d3a938", suffix:'%'},
                ];


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
