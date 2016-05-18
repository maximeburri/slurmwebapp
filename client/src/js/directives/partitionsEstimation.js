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
                if(!partition.error){
                    scope.selected = partition.PartitionName;
                    scope.estimation = false;
                }
            }

            scope.actualiseEstimation = function(){
                if(scope.jobToEstimate === undefined){
                    console.error("Job to estimate not defined");
                    return false;
                }

                loadingEstimation = true;

                function twoDigits(n){
                    return (n < 10 ? '0' : '') + n.toFixed();
                }

                estimatedTime =
                        twoDigits(scope.jobToEstimate.timeLimit.days) +
                        "-" +
                        twoDigits(scope.jobToEstimate.timeLimit.hours) +
                        ":" +
                        twoDigits(scope.jobToEstimate.timeLimit.minutes) +
                        ":" +
                        twoDigits(scope.jobToEstimate.timeLimit.seconds);
                console.log(estimatedTime);
                User.operation({verb:"estimate", object:"job", params:{
                    partition:scope.jobToEstimate.partition,
                    nbTasks:scope.jobToEstimate.nbTasks,
                    nbCPUsPerTasks:scope.jobToEstimate.nbCPUsPerTasks,
                    estimatedTime :estimatedTime}}).then(
                    // Success
                    function(data){
                        scope.estimationError = false;
                        console.log(data);
                        loadingEstimation = false;
                        scope.estimation = data;
                        scope.estimation.timeAgo  = data.estimatedTime - Math.round(new Date().getTime()/1000) ;
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
