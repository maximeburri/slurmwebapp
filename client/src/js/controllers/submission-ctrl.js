/**
 * Master Controller
 */

angular.module('RDash')
    .controller('SubmissionCtrl', ['$scope', '$rootScope', SubmissionCtrl]);

function SubmissionCtrl($scope, $rootScope) {
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

    $scope.licences = [
      {name: 'distrib_computing_toolbox@matlablm.unige.ch'},
      {name: 'matlab@matlablm.unige.ch'},
      {name: 'wavelet-toolbox@matlablm.unige.ch'},
      {name: 'statistics_toolbox@matlablm.unige.ch'}
    ];

    $scope.partitions = [
      {name: 'debug'},
      {name: 'bigmem'},
      {name: 'shared'},
      {name: 'mono'}
    ];

    $scope.notificationEvents = [
      {name: 'Commence'},
      {name: 'Termine'},
      {name: 'Échoue'},
      {name: 'Temps limite atteint'}
    ];
}
