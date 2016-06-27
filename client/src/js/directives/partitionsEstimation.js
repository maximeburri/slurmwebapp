angular
    .module('RDash')
    .directive('swaPartitionsEstimation', ['User', 'Memory', '$modal','$compile', swaPartitionsEstimation]);

function swaPartitionsEstimation(User, Memory, $modal, $compile) {
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
            scope.loadingStates = {};
            scope.rules = {};

            scopeRules = scope.$new(true);
            scopeRules.job = scope.jobToEstimate;
            scopeRules.user = {groups:[], user:""};

            var fncScopeRules = {
                // Transform to bytes
                "toBytes" : Memory.toBytes,

                // Check is user is a array of specified groups
                "isUserInGroups" : function(specifiedGroups){
                    if(typeof groups == "string")
                        groups = [groups];

                    // Foreach groups of specified groups
                    for(var i = 0;i<specifiedGroups.length;i++){
                        var specifiedGroup = specifiedGroups[i];
                        for(var j = 0;j<scopeRules.user.groups.length;j++){
                            var userGroup = scopeRules.user.groups[j];
                            if(userGroup == specifiedGroup)
                                return true;
                        }
                    }
                    return false;
                }
            };

            scopeRules.tools = fncScopeRules;

            if(scope.selectable == undefined)
                scope.selectable = false;

            function isNbCPUsInsufficient(job, partition){
                return (job.nbTasks > partition.totalCPUs ||
                    job.nbCPUsPerTasks > partition.totalCPUs ||
                    (job.nbTasks * job.nbCPUsPerTasks)
                        > partition.totalCPUs)
                    ? "Trop de CPUs demandés" : false;
            }

            function isTimeLimitExceed(job, partition){
                return (!partition.maxTime.unlimited &&
                    (job.timeLimit.seconds +
                    job.timeLimit.minutes * 60 +
                    job.timeLimit.hours * 60 * 60 +
                    job.timeLimit.days * 60 * 60 * 24) >
                    partition.maxTime.timestamp)
                    ? "Temps demandé trop grand" : false;
            }

            function executeRules(attributeType, job, partition){
                partitionsRules = scope.partitionsRules;
                partitionRules = [];
                if(partitionsRules[partition.partitionName] != undefined &&
                    partitionsRules[partition.partitionName][attributeType] != undefined)
                    partitionRules = partitionsRules[partition.partitionName][attributeType];


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
                            angular.copy(definedRule.parameters, parameters);
                        }

                        // Check parameter rules in partitions
                        if(rule.parameters != undefined)
                            mergeDictionary(parameters, rule.parameters);
                        scopeRules.parameters = parameters;

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
                    // Remove estimation
                    partition.estimation = false;

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

            scope.$watch("jobToEstimate.memory.bytesValue +  \
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
                    scope.loadingStates['partitions'] = 'finish';
                    scope.partitions = data.partitions;
                    updatePartitionByRules();
                },

                function(data){
                    scope.loadingStates['partitions'] = 'error';
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

            User.getUserInfo().then(
                function(data){
                    scopeRules.user = data.user;
                    console.log(scopeRules);
                    updatePartitionByRules();
                },

                function(data){
                    console.error(data);
                }
            )

            scope.itemClick = function(partition){
                if(partition.advice.type != "disabled"){
                    scope.selected = partition.partitionName;
                    scope.estimation = false;
                }
            }

            scope.actualiseEstimations = function(){
                // For all good partitions
                angular.forEach(scope.partitions, function(partition){
                    if(partition.advice.type === "disabled"){
                        partition.estimation = false;
                        return false;
                    }
                    partition.estimation = true;

                    if(scope.jobToEstimate === undefined){
                        console.error("Job to estimate not defined");
                        return false;
                    }

                    partition.loadingEstimation = true;

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
                        partition:partition.partitionName,
                        nbTasks:scope.jobToEstimate.nbTasks,
                        nbCPUsPerTasks:scope.jobToEstimate.nbCPUsPerTasks,
                        estimatedTime :estimatedTime}}).then(
                        // Success
                        function(data){
                            partition.estimationError = false;
                            console.log(data);
                            loadingEstimation = false;
                            partition.estimation = data;
                            partition.estimation.timeAgo  = data.estimatedTime - Math.round(new Date().getTime()/1000) ;
                            partition.loadingEstimation = false;
                        },

                        function(data){
                            console.error(data);
                            loadingEstimation = false;
                            partition.estimationError = true;
                            partition.loadingEstimation = false;
                        }
                    );
                });
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
