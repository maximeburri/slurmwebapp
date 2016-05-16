angular
    .module('RDash')
    .directive('swaPartitionsEstimation', ['User', '$modal','$compile', swaPartitionsEstimation]);

function swaPartitionsEstimation(User, $modal, $compile) {
    var directive = {
        restrict: 'AE',
        scope: { selected:'=', jobToEstimate:'='},
        templateUrl: 'templates/partitionsEstimation.html',
        controller: function(){
        },

        link: function(scope, element, attrs){
            scope.partitions = [];
            scope.loadingEstimation = false;
            scope.estimation = false;

            if(scope.selectable == undefined)
                scope.selectable = false;

            User.get('partitions').then(
                // Success
                function(data){
                    console.log(data);
                    scope.partitions = data.partitions;
                },

                function(data){
                    console.error(data);
                }
            );
            scope.itemClick = function(partition){
                scope.selected = partition.PartitionName;
                scope.estimation = false;
            }

            scope.actualiseEstimation = function(){
                if(scope.jobToEstimate === undefined){
                    console.error("Job to estimate not defined");
                    return false;
                }

                loadingEstimation = true;
                User.operation({verb:"estimate", object:"job", params:{
                    partition:scope.jobToEstimate.partition,
                    nbTasks:scope.jobToEstimate.nbTasks,
                    nbCPUsPerTasks:scope.jobToEstimate.nbCPUsPerTasks}}).then(
                    // Success
                    function(data){
                        scope.estimationError = false;
                        console.log(data);
                        loadingEstimation = false;
                        scope.estimation = data;
                        scope.estimation.timeAgo  = data.estimatedTime - Math.round(new Date().getTime()/1000) ;

                        scope.estimation.timeAgoSeconds = scope.estimation.timeAgo%60;
                        scope.estimation.timeAgoMinutes = Math.floor((scope.estimation.timeAgo - scope.estimation.timeAgoSeconds) / 60) % 60;
                        scope.estimation.timeAgoHours = Math.floor((scope.estimation.timeAgo - scope.estimation.timeAgoMinutes*60) / 3600) % 60;
                        scope.estimation.timeAgoDays = Math.floor((scope.estimation.timeAgo - scope.estimation.timeAgoHours*3600) / (3600*24));
                    },

                    function(data){
                        console.error(data);
                        loadingEstimation = false;
                        scope.estimation = false;
                        scope.estimationError = true;
                    }
                );
            }
        }
    };
    return directive;
};
