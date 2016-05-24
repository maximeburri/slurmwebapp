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

    $scope.options = [
      {name: 'MPI/gcc', subtitle: '', group: 'Défaut'},
      {name: 'C', subtitle: '', group: 'Défaut'},
      {name: 'Matlab', subtitle: '', group: 'Défaut'},
      {name: 'Stat', subtitle: '', group: 'Défaut'},
      {name: 'Tetras', subtitle: '', group: 'Personnalisé'}
    ];

    $scope.modules = [
      {name: 'MPI'},
      {name: 'gcc'},
      {name: 'R'},
      {name: 'Matlab'}
    ];

    $scope.licenses = [
    ];
    $scope.licensesArray = [];

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
