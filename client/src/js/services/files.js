angular.module('RDash').service('Files', ['$q', '$rootScope', 'User', Files]);

function Files($q, $rootScope, User) {
    this.getListFiles = function(dir){
        return User.get("files", {dir:dir});
    }

    // Get file content of path
    // If follow is true, then the server uses tail and return when new line
    // are added
    // else it uses simple cat
    this.getFileContent = function(path, follow){
        console.log("Follow:");
        console.log(follow);
        return User.get("file", {path:path,follow:follow}, follow);
    }
}
