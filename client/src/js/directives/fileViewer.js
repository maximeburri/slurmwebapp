angular
    .module('RDash')
    .directive('swaFileViewer', ['User', 'Files', '$modal','$compile', swaFileViewer]);

function swaFileViewer(User, Files, $modal, $compile) {
    var directive = {
        restrict: 'AE',
        scope: {filepath:'@'},
        templateUrl: 'templates/fileViewer.html',
        link: function(scope, element, attrs){
            scope.fileViewer = {}
            scope.fileViewer.content = "";
            scope.fileViewer.filepath = scope.filepath;
            scope.fileViewer.show = true;
            scope.fileViewer.not_exist = false;
            scope.fileViewer.too_big = false;
            scope.fileViewer.loading = true;
            scope.fileViewer.edit = false;
            scope.fileViewer.saved = true;

            Files.getFileContent(scope.filepath, false).then(
                function(data){
                    scope.fileViewer.loading = false;
                    scope.fileViewer.content = data.data;
                },
                function(err){
                    scope.fileViewer.loading = false;

                    if(err.type == "not_exist"){
                        scope.fileViewer.not_exist = true;
                    }else if(err.type == "too_big"){
                        scope.fileViewer.too_big = true;
                    }
                }
            )

            scope.edit = function(){
                scope.fileViewer.edit = true;
            }

            function str2ab(str) {
                  var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
                  var bufView = new Uint16Array(buf);
                  for (var i=0, strLen=str.length; i<strLen; i++) {
                      bufView[i] = str.charCodeAt(i);
                  }
                  return buf;
            }

            scope.save = function(){
                params = {
                    data : str2ab(scope.fileViewer.content),
                    filepath : scope.filepath
                };

                User.operation({verb:"upload", object:"file", params:params}).then(
                    // Success
                    function(successMessage){
                        scope.fileViewer.saved = true;
                    },
                    // Error
                    function(err){
                        console.error("Error upload");
                        console.error(err);

                        scope.fileViewer.saved = true;
                    }
                );
            }
        }
    };
    return directive;
};
