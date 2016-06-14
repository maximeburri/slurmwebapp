angular
    .module('RDash')
    .directive('swaFilesUpload', ['User', swaFilesUpload]);

function swaFilesUpload(User) {
    var directive = {

        scope: {
          swaFilesUpload: "=",
          swaFilesFolder: "=",
          swaOnFinish: "&?"
        },

        link: function (scope, element, attributes) {
            element.bind("change", function (changeEvent) {
                var readers = [] ,
                    files = changeEvent.target.files ,
                    datas = [] ;
                for ( var i = 0 ; i < files.length ; i++ ) {
                    readers[ i ] = new FileReader();
                    readers[ i ].filename = files[i].name;
                    readers[ i ].onload = function (loadEvent) {
                        //datas[i].data = loadEvent.target.result;
                        datas.push({
                            data : loadEvent.target.result,
                            filepath : loadEvent.target.filename
                        });
                        params = {
                            data : loadEvent.target.result,
                            filepath : scope.swaFilesFolder + loadEvent.target.filename
                        }
                        User.operation({verb:"upload", object:"file", params:params}).then(
                            // Success
                            function(successMessage){
                                console.log("Success upload");
                                console.log(successMessage);

                                if ( datas.length === files.length ){
                                    scope.swaFilesUpload = datas;
                                    if(scope.swaOnFinish !== undefined){
                                        scope.swaOnFinish(files);
                                    }
                                }
                            },
                            // Error
                            function(err){
                                console.error("Error upload");
                                console.error(err);

                                scope.swaFilesUpload = datas;
                                if(scope.swaOnFinish !== undefined){
                                    scope.swaOnFinish(datas[i], false);
                                }
                            }
                        );
                    }
                    readers[ i ].readAsArrayBuffer( files[i] );
                }
            });
        }
    };
    return directive;
};
