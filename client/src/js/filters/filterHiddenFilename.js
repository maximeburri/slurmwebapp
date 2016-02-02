angular
    .module('RDash')
    .filter('filterHiddenFilename', [filterHiddenFilename]);

function filterHiddenFilename() {
    return function(input, showHiddenFile) { // filter arguments
        console.log(showHiddenFile);
        var filtered = [];
        angular.forEach(input, function(file) {
            if((showHiddenFile && file.filename != '.' && file.filename != '..') ||
                (input.length > 1 && file.filename[0] != '.' && file.filename[0] != '~'))
               filtered.push(file);
        });

        return filtered;
    };
};
