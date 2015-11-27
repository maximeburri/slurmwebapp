angular.module('RDash').service('Files', ['$q', '$rootScope', 'User', Files]);

function Files($q, $rootScope, User) {
    $scope.getListFiles = function(dir){
        return User.get("files", {dir:dir});
    }
}
