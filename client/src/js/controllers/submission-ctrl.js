/**
 * Master Controller
 */

angular.module('RDash')
    .controller('SubmissionCtrl', ['$timeout', '$scope', '$rootScope',
        'User', 'Memory', '$modal', '$location',
        'Files', SubmissionCtrl]);

function SubmissionCtrl($timeout, $scope, $rootScope, User, Memory,
                        $modal, $location, Files) {
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

    fillRequiredAttribute = function(job, autoFirstDep){
        if(!$scope.job.memory)
            $scope.job.memory = {default:true, value:0, unit:null};

        if(job.modules && job.modules.module)
            $scope.updateModuleDependencies(job.modules.module, autoFirstDep);
        else{
            job.modules = {
                module : null,
                dependencies : null
            }
        }

        if(job.execution === undefined)
            job.execution = {command : "", executable :""};
        if(job.execution.command === undefined)
            job.execution.command = "";
        if(job.execution.executable === undefined)
            job.execution.executable = "";
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
                        oldJob[nameAttr] = angular.extend({},
                            oldJob[nameAttr],
                            newJob[nameAttr]);
                    }
                }
            }
        });

        fillRequiredAttribute(oldJob);
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
        $scope.job.predefinedSubmission = predefinedSubmission.name;
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
        predSub = predefinedSubmissionsDictionnary[$scope.job.predefinedSubmission];
        if(predSub)
            $scope.updateJobByPredefinedSubmission(predSub);
    }

    $scope.saveSubmissionScript = function(onlyVisualization){
        newScriptFile =
            Files.join($scope.parameters.projectFolder, $scope.parameters.batchFilename);

        params = {
            job : $scope.job,
            onlyVisualization : onlyVisualization,
            saveScriptFilePath  : newScriptFile
        };

        if($scope.parameters.projectType == "load"){
            params.readScriptFilePath = $scope.parameters.loadBatchFilepath;
        }

        return User.operation({verb:"save", object:"submissionScript",
            params:params});
    }


    $scope.submitJob = function(){
        var scriptPath =
            Files.join($scope.parameters.projectFolder,
                $scope.parameters.batchFilename);

        $scope.saveSubmissionScript().then(
            // Success
            function(result){
                User.operation({verb:"submit", object:"job",
                                params:{scriptPath:scriptPath}}).then(
                    // Success
                    function(successMessage){
                        console.log("Job submitted");
                        if(successMessage.id){
                            $location.path('/job/'+successMessage.id);
                        }
                    },
                    // Error
                    function(err){
                        alert("Impossible de soumettre le job, vérifier les ressources utilisées");
                        console.error("Job no submitted");
                    }
                );
                console.log(result);
            },
            // Error
            function(err){
                alert("Impossible d'écrire le script");
                console.error(err);
            }
        );
    }

    $scope.visualizeScript = function(){
        $scope.saveSubmissionScript(true).then(
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

    $scope.loadSubmissionScript = function(fileObject){
        $scope.parameters.projectFolder = Files.dirname(fileObject.filepath);
        $scope.parameters.batchFilename = Files.basename(fileObject.filepath);
        User.operation({verb:"load", object:"submissionScript",
            params:{scriptFile:fileObject.filepath}}).then(
            // Success
            function(result){
                if(!angular.equals({}, result.job)){
                    angular.copy(result.job, $scope.job);

                    fillRequiredAttribute($scope.job, false);
                }

            },
            // Error
            function(err){
                console.error(err);
            }
        );
    }

    // Position of cursor
    $scope.argsCursorPos = {
        blur : true,
        begin : 0,
        end : 0
    };

    // Update cursor pose (on-click or on-keyup)
    $scope.updateArgsCursorPos = function ($event) {
        $scope.argsCursorPos = {
            blur : false,
            begin : $event.target.selectionStart,
            end : $event.target.selectionEnd,
            lastFocus : null
        }
        console.log($scope.argsCursorPos);
    };

    // Create selection for edit or adds args
    function createSelection(field, start, end) {
      if( field.createTextRange ) {
        var selRange = field.createTextRange();
        selRange.collapse(true);
        selRange.moveStart('character', start);
        selRange.moveEnd('character', end);
        selRange.select();
        field.focus();
      } else if( field.setSelectionRange ) {
        field.focus();
        field.setSelectionRange(start, end);
      } else if( typeof field.selectionStart != 'undefined' ) {
        field.selectionStart = start;
        field.selectionEnd = end;
        field.focus();
      }
      $scope.argsCursorPos.blur = false;
      $scope.argsCursorPos.begin = start;
      $scope.argsCursorPos.end = end;
    }

    // Edit or add args
    $scope.editOrAddArgs = function(){
        newScope = $scope.$new();
        oldText = document.getElementById("inputArgs").value;
        newCursorPos = {};

        filepath = $scope.parameters.projectFolder + '/unknow';
        console.log(filepath)
        if($scope.argsCursorPos.begin != $scope.argsCursorPos.end){
            filepath = oldText.slice($scope.argsCursorPos.begin,
                    $scope.argsCursorPos.end);

            // Relative to absolute path (from projectFolder)
            filepath = Files.resolve($scope.parameters.projectFolder,
                        filepath);
        }

        // Browser files params
        newScope.browser = {
            selectable : true,
            selected : filepath,

            // On file selected, cut string and replace
            onFileSelected : function(file){
                // Absolute to relative path (from projectFolder)
                file.filepath = Files.relative($scope.parameters.projectFolder, file.filepath);

                $scope.job.execution.arguments =
                    oldText.slice(0, $scope.argsCursorPos.begin) +
                        file.filepath +
                    oldText.slice($scope.argsCursorPos.end,
                            oldText.length);

                newCursorPos.begin = $scope.argsCursorPos.begin-1;
                newCursorPos.end = newCursorPos.begin +file.filepath.length+1;
            }
        }

        var modal = $modal.open({
            templateUrl:"templates/modal/filesBrowser.html",
            scope:newScope
        });

        console.log(modal);

        // Modal finish
        modal.result.then(function(){}, function(){
            var input = document.getElementById("inputArgs");
            createSelection(input, newCursorPos.begin+1, newCursorPos.end);
        });
    }

    // On blur input args
    $scope.inputArgsBlur = function(){
        $timeout(function(){
            $scope.argsCursorPos.blur = true
        }, 400);
    }

    $scope.editCommand = function(){
        newScope = $scope.$new();
        // Relative to absolute path (from projectFolder)
        filepath = Files.resolve($scope.parameters.projectFolder,
                    $scope.job.execution.executable);
        newScope.browser = {
            selectable : true,
            selected : filepath,
            onFileSelected : function(file){
                // Absolute to relative path (from projectFolder)
                file.filepath = Files.relative($scope.parameters.projectFolder, file.filepath);
                $scope.job.execution.executable = file.filepath;
            }
        }

        $modal.open({
            templateUrl:"templates/modal/filesBrowser.html",
            scope:newScope
        });
    }
}
