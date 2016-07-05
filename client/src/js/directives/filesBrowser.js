angular
    .module('RDash')
    .directive('swaFilesBrowser', ['User', 'Files', '$modal','$compile', swaFilesBrowser]);

function swaFilesBrowser(User, Files, $modal, $compile) {
    var directive = {
        restrict: 'AE',
        scope: {
            selectable:'@',
            selectableTypes:'@',
            selected:'=',
            tableStyle:'@',
            onFileSelected:'&?',
            fileViewable : '@?'},
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
            if(scope.fileViewable === undefined)
                scope.fileViewable = false;

            scope.fileViewer = {
                content : "",
                filepath : "",
                modified : false,
                not_exist : false,
                show : false
            };
            scope.files = [];
            scope.currentDir = ".";
            if(scope.selected){
                scope.currentDir = Files.dirname(scope.selected);
            }

            scope.loading = false;
            /* Copy path, copy.filepath & copy.type ('folder', 'file')*/
            scope.copy = undefined;
            promiseSocketContentFile = false;
            var scope = scope;
            var that = this;

            // Request a new file with a prompt
            // Type can be "file" or "folder"
            scope.newFilePrompt = function(type, copyFilepath){
                params = {
                    newFilepath:null
                };

                if(copyFilepath)
                    params.sourceFilepath = copyFilepath;

                completeFileType = (type == "file" ? "fichier" : "dossier");
                newFile =
                 prompt("Nom du nouveau " + completeFileType, "nouveau " + completeFileType);

                if(newFile){
                    params.newFilepath = scope.currentDir + newFile;
                    params.type = type;

                    var verb = "new";
                    if(copyFilepath)
                        verb = "copy";

                    User.operation({verb:verb, object:"file", params:params}).then(
                        // Success
                        function(successMessage){
                            console.log("Success new file");
                            console.log(successMessage);
                            scope.updateFiles(scope.currentDir);
                        },
                        // Error
                        function(err){
                            alert('Impossible de créer le ' + completeFileType + " " +
                            params.newFilepath);
                        }
                    );
                }
            }

            // Context menu icon and name to html
            toHTMLItem = function(icon, name, subicon){
                return '<a tabindex="-1" href="#" style="padding-right: 8px;">\
                            <i class="fa fa-'+icon+'" style="width:20px"></i> ' +
                            name +
                        '</a>';
            }
            // Context menu to folder
            scope.menuOptionsCurrentFolder = [
                /* NEW FILE */
                {
                    html: toHTMLItem('file-o', "Nouveau fichier"),
                    enabled: function() {return true},
                    click: function () {
                        scope.newFilePrompt("file");
                    }
                },
                /* NEW FOLDER */
                {
                    html: toHTMLItem('folder-open', "Nouveau dossier"),
                    enabled: function() {return true},
                    click: function () {
                        scope.newFilePrompt("folder");
                    }
                },
                null,
                /* PASTE */
                {
                    html: toHTMLItem('clipboard', "Coller"),
                    enabled: function() {return scope.copy},
                    click: function () {
                        scope.newFilePrompt(scope.copy.type, scope.copy.filepath)
                    }
                }
            ];

            // Menu context to item file
            scope.menuOptionsFile = [
                /* Visualize */
                {
                    html: toHTMLItem('eye', "Visualiser"),
                    enabled: function($itemScope) {return $itemScope.file.type == "file"},
                    click: function ($itemScope) {
                        filepath = scope.currentDir +$itemScope.file.filename;
                        scope.viewFile(filepath);
                    }
                },
                null,
                /* REMOVE */
                {
                    html: toHTMLItem('times', "Supprimer"),
                    enabled: function() {return true},
                    click: function ($itemScope) {
                        params = {
                            filepath:scope.currentDir +$itemScope.file.filename
                        };

                        // Confirm suppression
                        confirmRemove = confirm("Etes vous sûr de vouloir supprimer " +
                            params.filepath);

                        if(confirmRemove){
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
                    }
                },
                /* RENAME */
                {
                    html: toHTMLItem('pencil-square-o', "Renommer"),
                    enabled: function() {return true},
                    click: function ($itemScope) {
                        params = {
                            newFilepath:scope.currentDir + $itemScope.file.filename,
                            oldFilepath:scope.currentDir + $itemScope.file.filename
                        };

                        newFile =
                         prompt("Entrez le nouveau nom du fichier : ", $itemScope.file.filename);

                        if(newFile){
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
                    }
                },
                null,
                /* COPY*/
                {
                    html: toHTMLItem('clipboard', "Copier"),
                    enabled: function() {return true},
                    click: function ($itemScope) {
                        var type = "folder";
                        if($itemScope.file.type != "folder")
                            type = "file";

                        scope.copy = {
                            filepath:scope.currentDir +
                                $itemScope.file.filename,
                            type : type
                        };
                    }
                }
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
                }else if(scope.fileViewable){
                    scope.viewFile(futurDir);
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
                newScope = scope.$new(false);
                newScope.filepath = filePath;

                $modal.open({
                    templateUrl:"templates/modal/fileViewer.html",
                    scope:newScope,
                    size:'lg'
                });
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
