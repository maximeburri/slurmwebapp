/**
 * Master Controller
 */

angular.module('RDash')
    .controller('SubmissionCtrl', ['$scope', '$rootScope', 'User', SubmissionCtrl]);

function SubmissionCtrl($scope, $rootScope, User) {
    $scope.job = {};
    $scope.job.timeLimit = {
        days:0,
        hours : 1,
        minutes : 0,
        seconds : 0,

    }
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
            var i = 0;
            angular.forEach(data.licenses, function(license){
                switch (i) {
                    case 0:
                        license.Free = 0;
                        break;
                    case 1:
                        license.Used = license.Total - 1;
                        license.Free = 1;
                        break;
                    case 2:
                        license.Used = license.Total / 2;
                        license.Free = license.Total / 2;
                        break;
                }
                i++;
            });
            $scope.licenses = data.licenses;
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
