/**
 * Master Controller
 */

angular.module('RDash')
    .controller('SubmissionCtrl', ['$scope', '$rootScope', 'User', 'Memory', SubmissionCtrl]);

function SubmissionCtrl($scope, $rootScope, User, Memory) {
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
        module: null
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
            console.log(data);
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
            console.log(data.default);
            try {
                $scope.defaultJob =
                    predefinedSubmissionsDictionnary[data.default]

                $scope.job.predefinedSubmission = $scope.defaultJob;
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

    $scope.updateModuleDependencies = function(module){
        $scope.loadings['moduleDependencies'] = 'loading';
        User.get('module', {moduleName:module}).then(
            // Success
            function(data){
                $scope.loadings['moduleDependencies'] = 'finish';

                $scope.moduleDependencies = data.dependencies;

                // Take first auto if module has dependencies
                if(data.dependencies.length > 0)
                    job.moduleDependencies = data.dependencies[0];
            },
            function(data){
                $scope.loadings['moduleDependencies'] = 'error';
                console.error(data);
            }
        );
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

        // Merge between job and predefined submission
        replaceInsteadMerge = ['notificationEvents', 'licenses', 'modules'];

        angular.forEach(predefinedSubmission.job, function (attr, nameAttr){
            if(predefinedSubmission.job[nameAttr] != undefined){
                if(typeof attr !== 'object' ||
                    replaceInsteadMerge.indexOf(nameAttr) >= 0)
                    $scope.job[nameAttr] = predefinedSubmission.job[nameAttr];
                else
                    $scope.job[nameAttr] = angular.merge({},
                        $scope.job[nameAttr],
                        predefinedSubmission.job[nameAttr]);
            }
        });
    }

    $scope.notificationEvents = [
      {name: 'Commence'},
      {name: 'Termine'},
      {name: 'Échoue'},
      {name: 'Temps limite atteint'}
    ];

    $scope.$watch("job.memory.value + job.memory.unit",
        function(){
            $scope.job.memory.bytesValue = Memory.toBytes($scope.job.memory.value,
                                                      $scope.job.memory.unit);
            console.log($scope.job.memory.bytesValue);
        }
    );

    $scope.$watch("job.module",
        function(){
            $scope.updateModuleDependencies($scope.job.module);
        }
    );

    $scope.submitJob = function(){
        User.operation({verb:"submit", object:"job", params:{job:$scope.job}}).then(
            // Success
            function(successMessage){
                console.log("Job submitted");
            },
            // Error
            function(err){
                console.error("Job no submitted");
            }
        );
    }
}
