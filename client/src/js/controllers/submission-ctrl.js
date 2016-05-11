/**
 * Master Controller
 */

angular.module('RDash')
    .controller('SubmissionCtrl', ['$scope', '$rootScope', 'User', SubmissionCtrl]);

function SubmissionCtrl($scope, $rootScope, User) {
    $scope.jobFileSelected = undefined;

    $scope.parameters = {
        submissionType : "submission",
        userType : "novice",
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

    User.get('licenses').then(
        // Success
        function(data){
            $scope.licenses = data.licenses;
        },

        function(data){
            console.error(data);
        }
    );

    $scope.partitions = [
    ];

    User.get('partitions').then(
        // Success
        function(data){
            $scope.partitions = data.partitions;
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
}
