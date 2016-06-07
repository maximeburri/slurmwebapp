/**
 * Master Controller
 */

angular.module('RDash')
    .controller('SubmissionCtrl', ['$scope', '$rootScope', 'User', 'Memory',
        '$modal', '$location', SubmissionCtrl]);

function SubmissionCtrl($scope, $rootScope, User, Memory, $modal, $location) {
    $scope.projectBrowserSelectableTypes = ["folder"];

    $scope.loadings = {};

    $scope.job = {
        memory:{
            value:0,
            unit:'MB',
            bytesValue:0,
            default:true
        },
        nbTasks:1,
        nbCPUsPerTasks:1,
        timeLimit :{
            days:0,
            hours : 1,
            minutes : 0,
            seconds : 0
        },
        modules : {
            module : null,
            dependencies : null
        },
        licenses : []
    };

    $scope.defaultJob = {};

    $scope.jobFileSelected = undefined;

    $scope.parameters = {
        submissionType : "submission",
        userType : "expert",
        execFileType : "paste",
        projectType : 'new'
    };

    // Predefined submissions for select option
    $scope.predefinedSubmissions = [
    ];

    // Dictionnary predefined submissions by "name" : predefined_submissions of
    // $scope.predefinedSubmissions
    predefinedSubmissionsDictionnary = {
    };

    $scope.modules = [
    ];

    $scope.moduleDependencies = [
    ];

    $scope.licenses = [
    ];

    User.get('licenses').then(
        // Success
        function(data){
            $scope.loadings['licenses'] = 'finish';
            var i = 0;
            $scope.licenses = data.licenses;
        },

        function(data){
            $scope.loadings['licenses'] = 'error';
            console.error(data);
        }
    );

    User.get('modules').then(
        // Success
        function(data){
            $scope.modules = data.modules;
            $scope.loadings['modules'] = 'finish';
        },

        function(data){
            console.error(data);
            $scope.loadings['modules'] = 'error';
        }
    );

    User.get('configuration', {type:"predefined_submissions"}).then(
        // Success
        function(data){
            $scope.loadings['predefinedSubmissions'] = 'finish';

            // Check if no group, group 'default'
            angular.forEach(data.predefinedSubmissions, function(submission){
                if(submission.group == undefined)
                    submission.group = "Défaut";

                predefinedSubmissionsDictionnary[submission.name] = submission;
            });

            // Store in scope
            $scope.predefinedSubmissions =
                data.predefinedSubmissions != undefined ?
                data.predefinedSubmissions : [];

            // Update field to default
            try {
                $scope.defaultJob =
                    predefinedSubmissionsDictionnary[data.default]

                $scope.updateJobByPredefinedSubmission($scope.defaultJob);
            }
            catch(err){
                console.error("Default predefined submission dosn't exist");
            }

        },

        function(data){
            $scope.loadings['predefinedSubmissions'] = 'error';
            console.error(data);
        }
    );

    $scope.updateModuleDependencies = function(module, autoFirst){
        $scope.loadings['moduleDependencies'] = 'loading';
        if(module){
            User.get('module', {moduleName:module}).then(
                // Success
                function(data){
                    $scope.loadings['moduleDependencies'] = 'finish';

                    $scope.moduleDependencies = data.dependencies;

                    // Take first auto if module has dependencies
                    if(autoFirst){
                        if(data.dependencies.length > 0)
                            $scope.job.modules.dependencies = data.dependencies[0];
                        else
                            $scope.job.modules.dependencies = null;
                    }
                },
                function(data){
                    $scope.loadings['moduleDependencies'] = 'error';
                    console.error(data);
                }
            );
        }
    }

    changeJob = function(newJob, oldJob){
        // Merge between job and predefined submission
        replaceInsteadMerge = ['notificationEvents', 'licenses', 'modules', 'memory'];

        angular.forEach(newJob, function (attr, nameAttr){
            if(newJob[nameAttr] != undefined){

                if(typeof attr !== 'object'){
                    newJob[nameAttr] =
                        oldJob[nameAttr];
                }else{
                    if(replaceInsteadMerge.indexOf(nameAttr) >= 0){
                        if(Array.isArray(attr)){
                            oldJob[nameAttr] = newJob[nameAttr].slice();
                        }else
                        oldJob[nameAttr] =
                          angular.copy(newJob[nameAttr],
                            oldJob[nameAttr]);
                    }
                    else{
                        oldJob[nameAttr] = angular.merge({},
                            oldJob[nameAttr],
                            newJob[nameAttr]);
                    }
                }
            }
        });

        if(newJob.modules && newJob.modules.module)
            $scope.updateModuleDependencies(newJob.modules.module);
        else{
            newJob.modules = {
                module : null,
                dependencies : null
            }
        }
    }

    $scope.resetModule = function(){
        job.modules.module = null;
        job.modules.dependencies = null;
        $scope.updateModuleDependencies($scope.job.modules.module);
    }

    $scope.resetNotifications = function(){
        job.notificationEvents = [];
        job.notificationEmail = "";
    }

    $scope.updateJobByPredefinedSubmission = function(predefinedSubmission){
        // Has parent parameters ? recursive merge
        if(predefinedSubmission.parent != undefined){
            if(predefinedSubmission.parent == "default" &&
                predefinedSubmission.name !== $scope.defaultJob.name){
                $scope.updateJobByPredefinedSubmission($scope.defaultJob);
            }else{
                try {
                    $scope.updateJobByPredefinedSubmission
                        (predefinedSubmissionsDictionnary[predefinedSubmission.parent]);
                }
                catch(err){
                    console.error("Parent predefined submission dosen't exist");
                }
            }
        }

        changeJob(predefinedSubmission.job, $scope.job);
    }

    $scope.notificationEvents = [
      {name: 'Commence', value : 'BEGIN'},
      {name: 'Termine', value : 'END'},
      {name: 'Échoue', value : 'FAIL'},
      {name: 'Temps limite atteint', value : 'TIME_LIMIT'}
    ];

    $scope.$watch("job.memory.value + job.memory.unit",
        function(){
            if($scope.job.memory){
                $scope.job.memory.bytesValue =
                        Memory.toBytes($scope.job.memory.value,
                                     $scope.job.memory.unit);
            }
        }
    );

    $scope.predefinedSubmissionChange = function(){
        if($scope.job.predefinedSubmission)
            $scope.updateJobByPredefinedSubmission($scope.job.predefinedSubmission);
    }


    $scope.submitJob = function(){
        script = $scope.parameters.batchFile;
        params = {
            readScriptFilePath : script,
            job : $scope.job
        }
        User.operation({verb:"save", object:"submissionScript",
            params:params}).then(
            // Success
            function(result){
                User.operation({verb:"submit", object:"job", params:{scriptPath:script}}).then(
                    // Success
                    function(successMessage){
                        console.log("Job submitted");
                        if(successMessage.id){
                            $location.path('/job/'+successMessage.id);
                        }
                    },
                    // Error
                    function(err){
                        console.error("Job no submitted");
                    }
                );
                console.log(result);
            },
            // Error
            function(err){
                console.error(err);
            }
        );
    }

    $scope.loadSubmissionScript = function(fileObject){
        User.operation({verb:"load", object:"submissionScript",
            params:{scriptFile:fileObject.filepath}}).then(
            // Success
            function(result){
                if(!angular.equals({}, result.job)){
                    angular.copy(result.job, $scope.job);

                    if(!$scope.job.memory)
                        $scope.job.memory = {default:true, value:0, unit:null};

                    // Update dependencies but no choose the first
                    if($scope.job.modules && $scope.job.modules.module)
                        $scope.updateModuleDependencies(
                            $scope.job.modules.module, false);
                }

            },
            // Error
            function(err){
                console.error(err);
            }
        );
    }

    $scope.visualizeScript = function(){
        params = {
            readScriptFilePath : $scope.parameters.batchFile,
            job : $scope.job,
            onlyVisualization : true
        }
        User.operation({verb:"save", object:"submissionScript",
            params:params}).then(
            // Success
            function(result){
                scope = $scope.$new(true);
                scope.script = result.script;
                $modal.open({
                    template:"<pre>{{script}}</pre>",
                    scope:scope
                });
                console.log(result);
            },
            // Error
            function(err){
                console.error(err);
            }
        );
    }
}
