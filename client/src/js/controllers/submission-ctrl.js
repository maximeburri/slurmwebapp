/**
 * Master Controller
 */

angular.module('RDash')
    .controller('SubmissionCtrl', ['$scope', '$rootScope', 'User', 'Memory', SubmissionCtrl]);

function SubmissionCtrl($scope, $rootScope, User, Memory) {
    $scope.job = {
        memory:{
            value:0,
            unit:'MB',
            bytesValue:0,
            default:true
        },
        nbTasks:1,
        nbCPUsPerTasks:1,
    };

    $scope.job.timeLimit = {
        days:0,
        hours : 1,
        minutes : 0,
        seconds : 0,

    }
    $scope.jobFileSelected = undefined;

    $scope.parameters = {
        submissionType : "submission",
        userType : "expert",
        execFileType : "paste"
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

    $scope.licenses = [
    ];

    User.get('licenses').then(
        // Success
        function(data){
            var i = 0;
            $scope.licenses = data.licenses;
        },

        function(data){
            console.error(data);
        }
    );

    User.get('modules').then(
        // Success
        function(data){
            $scope.modules = data.modules;
            console.log(data);
        },

        function(data){
            console.error(data);
        }
    );

    User.get('configuration', {type:"predefined_submissions"}).then(
        // Success
        function(data){
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
        },

        function(data){
            console.error(data);
        }
    );

    $scope.updateJobByPredefinedSubmission = function(predefinedSubmission){
        // Has parent paramters ? recursive merge
        if(predefinedSubmission.parent != undefined){
            try {
                $scope.updateJobByPredefinedSubmission
                    (predefinedSubmissionsDictionnary[predefinedSubmission.parent]);
            }
            catch(err){
                console.error("Parent predefined submission dosen't exist");
            }
        }

        angular.merge($scope.job, predefinedSubmission.job)
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
}
