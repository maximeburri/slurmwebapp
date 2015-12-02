angular.module('RDash').service('Files', ['$q', '$rootScope', 'User', Files]);

function Files($q, $rootScope, User) {
    this.getListFiles = function(dir){
        return User.get("files", {dir:dir});
    }

    this.getFileContent = function(path, follow){
        console.log("Follow:");
        console.log(follow);
        return User.get("file", {path:path}, follow);
    }
}
