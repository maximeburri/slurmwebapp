angular
    .module('RDash')
    .directive('swaFilesBrowser', ['$window', 'User', 'Files', '$modal','$compile', swaFilesBrowser]);

function swaFilesBrowser($window, User, Files, $modal, $compile) {
    var directive = {
        restrict: 'AE',
        scope: {
            selectable:'@',
            selectableTypes:'@',
            selected:'=',
            tableStyle:'@',
            onFileSelected:'&?'},
        templateUrl: 'templates/filesBrowser.html',
        link: function(scope, element, attrs){
            scope.options = {};
            scope.options.showHiddenFiles = false;
            if(scope.selectable === undefined)
                scope.selectable = false;
            if(scope.selectableTypes === undefined)
                scope.selectableTypesArray = ["executable", 'file', 'symboliclink'];
            else{
                scope.selectableTypesArray = JSON.parse(scope.selectableTypes);
            }

            scope.fileViewer = {
                content : "",
                filepath : "",
                modified : false,
                not_exist : false,
                show : false
            };
            scope.files = [];
            scope.currentDir = ".";
            scope.loading = false;
            promiseSocketContentFile = false;
            var scope = scope;
            var that = this;

            //Menu context
            scope.menuOptionsFile = [
                ['Supprimer', function ($itemScope) {
                    params = {
                        filepath:scope.currentDir +$itemScope.file.filename
                    };

                    // Confirm suppression
                    confirm = $window.confirm("Etes vous sûr de vouloir supprimer " +
                        params.filepath);

                    if(confirm){
                        User.operation({verb:"remove", object:"file", params:params}).then(
                            // Success
                            function(successMessage){
                                console.log("Success remove");
                                console.log(successMessage);
                                scope.updateFiles(scope.currentDir);
                            },
                            // Error
                            function(err){
                                alert('Impossible de supprimer le fichier ' + params.filepath)
                            }
                        );
                    }
                }],
                ['Renommer', function ($itemScope) {
                    params = {
                        newFilepath:scope.currentDir + $itemScope.file.filename,
                        oldFilepath:scope.currentDir + $itemScope.file.filename
                    };

                    newFile =
                     prompt("Entrez le nouveau nom du fichier : ", $itemScope.file.filename);

                    if(params.newFile){
                        params.newFilepath = scope.currentDir + newFile;
                        User.operation({verb:"move", object:"file", params:params}).then(
                            // Success
                            function(successMessage){
                                console.log("Success remove");
                                console.log(successMessage);
                                scope.updateFiles(scope.currentDir);
                            },
                            // Error
                            function(err){
                                alert('Impossible de renommer le fichier ' +
                                params.oldFilepath + " en " +
                                params.newFilepath)
                            }
                        );
                    }
                }],

            ]

            // Stop follow file on destroy
            scope.$on("$destroy", function() {
                scope.stopFollowFileContent();
            });

            scope.updateFiles = function(dir){
                scope.loading = true;
                return Files.getListFiles(dir).then(
                    // Success
                    function(data){
                        scope.currentDir = data.path;
                        scope.files = data.files;
                        scope.loading = false;
                    }
                );
            }

            scope.goToFile = function(file){
                scope.stopFollowFileContent();
                futurDir = scope.currentDir + file.filename;

                if(file.type == "folder" || file.type == "symboliclink"){
                    scope.fileViewer.show = false;
                    scope.updateFiles(futurDir).catch(
                        function(err){
                            scope.loading = false;
                            if(err.type == "ACCESS_DENIED"){
                                scope.showAlertAccessFailed(futurDir);
                            }else{
                                console.error("Unknow error");
                                console.error(err);
                            }

                        }
                    );
                }else{

                }
            }

            scope.itemClick = function(file){
                if(scope.selectable && scope.isSelectableFile(file)){
                    scope.selected = scope.currentDir + file.filename;
                    if(typeof scope.onFileSelected === 'function' &&
                        scope.onFileSelected() &&
                        typeof scope.onFileSelected() === "function")
                        scope.onFileSelected()(
                            {
                                filename: file.filename,
                                dir: scope.currentDir,
                                filepath: scope.currentDir + file.filename
                            }
                        );
                }
                else if(scope.fileReadContent){
                    scope.goToFile(file);
                }
            }

            scope.itemDoubleClick = function(file){
                if(file.type == 'folder')
                    scope.goToFile(file);
            }

            scope.actualiseListFiles = function(){
                scope.goToFile({filename:'.', type:'folder'});
            }

            scope.goToParentFolder = function(){
                scope.goToFile({filename:"..", type:"folder"});
            }

            scope.stopFollowFileContent = function(){
                if(promiseSocketContentFile){
                    promiseSocketContentFile.stop();
                    delete promiseSocketContentFile;
                    promiseSocketContentFile = false;
                }
            }

            scope.showAlertAccessFailed = function(dirFailed){
                scope.modalError = {};
                scope.modalError.message = "Impossible d'accéder à " + dirFailed;
                var modalInstance = $modal.open({
                    animation: true,
                    templateUrl: 'templates/modal/simpleError.html',
                    scope:scope
                });
            }

            scope.viewFileRefresh = function(){
                scope.stopFollowFileContent();
                scope.viewFile(scope.fileViewer.filepath);
            }

            scope.viewFile = function(filePath){
                scope.fileViewer.content = "";
                scope.fileViewer.modified = false;
                scope.fileViewer.filepath = filePath;
                promiseSocketContentFile = Files.getFileContent(filePath, true);
                scope.fileViewer.show = true;
                scope.fileViewer.not_exist = false;
                scope.fileViewer.too_big = false;
                promiseSocketContentFile.then(
                    // Success
                    function(successMessage){
                        console.log("Success");
                        console.log(successMessage);
                    },
                    // Error
                    function(err){
                        console.log("Fail");
                        console.log(err);
                        if(err.type == "not_exist"){
                            scope.fileViewer.not_exist = true;
                        }else if(err.type == "too_big"){
                            scope.fileViewer.too_big = true;
                        }else{
                            scope.fileViewer.modified = true;
                        }
                        scope.stopFollowFileContent();
                    },
                    // Progress
                    function(notificationMessage){
                        console.log("Notification");
                        console.log(notificationMessage);
                        scope.fileViewer.content += notificationMessage.data;
                    }
                );
            }

            // Check if file is selectable if type is in selectableTypes
            scope.isSelectableFile = function(file) {
                if(scope.selectableTypesArray.indexOf(file.type) > -1) { //test the Status
                   return true;
                }
                return false;
            }


            scope.onUploadFinish = function(files, error){
                if(error){
                    scope.uploadError = true;
                    scope.uploadSuccess = false;
                }else{
                    scope.uploadSuccess = true;
                    scope.uploadError = false;
                }
                scope.uploadLoading = false;
                scope.updateFiles(scope.currentDir);
            };

            scope.onUploadBegin = function(files){
                scope.uploadLoading = true;
                scope.uploadSuccess = false;
                scope.uploadError = false;
            }

            scope.updateFiles(scope.currentDir);
        }
    };
    return directive;
};
