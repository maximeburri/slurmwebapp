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
            scope.partitionsRules = {};
            scope.rules = {};

            scopeRules = scope.$new(true);
            scopeRules.job = scope.jobToEstimate;

            if(scope.selectable == undefined)
                scope.selectable = false;

            function isNbCPUsInsufficient(job, partition){
                return (job.nbTasks > partition.TotalCPUs ||
                    job.nbCPUsPerTasks > partition.TotalCPUs ||
                    (job.nbTasks * job.nbCPUsPerTasks)
                        > partition.TotalCPUs)
                    ? "Trop de CPUs demandés" : false;
            }

            function isTimeLimitExceed(job, partition){
                return (!partition.MaxTime.Unlimited &&
                    (job.timeLimit.seconds +
                    job.timeLimit.minutes * 60 +
                    job.timeLimit.hours * 60 * 60 +
                    job.timeLimit.days * 60 * 60 * 24) >
                    partition.MaxTime.Timestamp)
                    ? "Temps demandé trop grand" : false;
            }

            function executeRules(attributeType, job, partition){
                partitionsRules = scope.partitionsRules;
                partitionRules = [];
                if(partitionsRules[partition.PartitionName] != undefined &&
                    partitionsRules[partition.PartitionName][attributeType] != undefined)
                    partitionRules = partitionsRules[partition.PartitionName][attributeType];


                scopeRules.partition = partition;


                for(i = 0;i<partitionRules.length;i++){
                    var rule = partitionRules[i];
                    var parameters = {};

                    // Predefined type
                    if(rule.type != undefined){
                        definedRule = scope.rules[rule.type];
                        if(definedRule == undefined){
                            console.error("No rule of "+rule.type);
                            return false;
                        }

                        // Check parameters rules
                        if(definedRule.parameters != undefined){
                            parameters = definedRule.parameters;
                        }
                        console.log(parameters);
                        // Check parameter rules in partitions
                        if(rule.parameters != undefined)
                            mergeDictionary(parameters, rule.parameters);
                        console.log(parameters);
                        scopeRules.parameters = parameters;
                        console.log(scopeRules.parameters);
                        if(scopeRules.$eval(definedRule.rule)){
                            var reason = rule.reason;

                            if(reason == undefined)
                                reason = definedRule.reason;

                            return reason != undefined ? reason : true;
                        }
                    }
                    else if(rule.rule != undefined && typeof rule.rule == "string"){
                        scopeRules.parameters = rule.parameters;

                        if(scopeRules.$eval(rule.rule))
                            return rule.reason != undefined ? rule.reason : true;
                    }
                }
                return false;
            }

            function isDiscouraged(job, partition){
                return executeRules("discouraged", job, partition);
            }

            function isDisabled(job, partition){
                // Default fnc to disabled
                disabledDefaultsFnc = [isNbCPUsInsufficient, isTimeLimitExceed];
                for(i = 0;i<disabledDefaultsFnc.length; i++){
                    fnc = disabledDefaultsFnc[i];
                    result = fnc(job, partition);
                    if(result)
                        return result;
                }

                return executeRules("disabled", job, partition);
            }

            function mergeDictionary(dict1, dict2){
                angular.forEach(dict2, function(object, name){
                    dict1[name] = object;
                });
                return dict1;
            }

            function updatePartitionByRules(){
                job = scope.jobToEstimate;

                angular.forEach(scope.partitions, function(partition){
                    // Disabled ?
                    if((result = isDisabled(job, partition))){
                        partition.advice = {};
                        partition.advice.type = "disabled";
                        partition.advice.reason = result === true ? "" : result;
                    }
                    // So discouraged ?
                    else if((result = isDiscouraged(job, partition))){
                        partition.advice = {};
                        partition.advice.type = "discouraged";
                        partition.advice.reason = result === true ? "" : result;
                    }
                    // So enabled
                    else{
                        partition.advice = {};
                        partition.advice.type = "enabled";
                        partition.advice.reason = "";
                    }
                });
            }

            scope.$watch("jobToEstimate.memory +  \
                        jobToEstimate.nbTasks +  \
                        jobToEstimate.nbCPUsPerTasks + \
                        jobToEstimate.timeLimit.days  + \
                        jobToEstimate.timeLimit.hours  + \
                        jobToEstimate.timeLimit.minutes  + \
                        jobToEstimate.timeLimit.seconds",
                updatePartitionByRules
            );

            User.get('partitions').then(
                // Success
                function(data){
                    scope.partitions = data.partitions;
                    updatePartitionByRules();
                },

                function(data){
                    console.error(data);
                }
            );

            User.get('configuration', {type:"partitions_rules"}).then(
                // Success
                function(data){
                    scope.partitionsRules = data.partitions != undefined ?
                                            data.partitions : [];
                    if(data.rules != undefined)
                        mergeDictionary(scope.rules, data.rules);

                    updatePartitionByRules();
                },

                function(data){
                    console.error(data);
                }
            );

            scope.itemClick = function(partition){
                if(partition.advice.type != "disabled"){
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
            scope.partitionOrder = function(partition){
                if (partition.advice.type == "enabled") return 1;
                if (partition.advice.type == "discouraged") return 2;
                if (partition.advice.type == "disabled") return 3;
            }

        }
    };
    return directive;
};
