/**
 * Master Controller
 */

angular.module('RDash')
    .controller('LoginCtrl', ['$rootScope', '$location',
    '$cookieStore', 'User','Files',
    '$timeout', LoginCtrl]);

function LoginCtrl($rootScope, $location, $cookieStore, User, Files, $timeout) {
    console.log(CONFIG);

    if($rootScope.authenticated == undefined){
        $rootScope.connectionProcessing = false;
        $rootScope.authenticated = false;
        $rootScope.connection = {error:{}};
        $rootScope.messageOfTheDay = "Aucun message";

        // Default input
        $rootScope.user = {
            username : CONFIG.credentials.username,
            password : CONFIG.credentials.password,
            cluster  : CONFIG.credentials.cluster,
            bridge   : CONFIG.credentials.bridge,
        };
    }

    $rootScope.login = function() {
        // Global variable
        $rootScope.connectionProcessing = true;
        $rootScope.connection.error = {};

        // Try connect
        User.connect($rootScope.user).then(
            // Success
            function(successMessage){
                console.log(successMessage);
            },
            // Error
            function(failMessage){
                $rootScope.connectionProcessing = false;
                $rootScope.authenticated = false;
                console.log("Failed message "+failMessage.type)
                if(failMessage.type == "socket-timeout")
                    $rootScope.connection.error.isBridge = true;
                else if(failMessage.type == "client-authentication")
                    $rootScope.connection.error.isAuthentication = true;
                else if(failMessage.type == "client-socket")
                    $rootScope.connection.error.isCluster = true;
                else if(failMessage.type == "disconnect"){
                    $rootScope.connection.error.bridgeDisconnected = true;
                }else if(failMessage.type == "cluster-rejected"){
                    $rootScope.connection.error.isClusterRejected = true;
                }

                // If banned in info
                if(failMessage.info && failMessage.info.banned){
                    $rootScope.connection.error.isBanned = true;
                    $rootScope.connection.error.bannedInfo = failMessage.info;
                    $rootScope.connection.error.bannedInfo.timestampUnban++;

                    // No banned in now-timstampUnban time
                    $timeout(function () {
                            console.log("Finish banned");
                            $rootScope.connection.error.isBanned = false;
                        },
                        failMessage.info.timestampUnban*1000 -
                        (new Date).getTime() - 1000);
                }
            },
            // Progress
            function(updateMessage){
                console.log(updateMessage);
                if(updateMessage == "authenticated"){
                    $rootScope.connectionProcessing = false;
                    $rootScope.authenticated = true;

                    $rootScope.alerts = [{
                        type: 'success',
                        msg: "Vous avez été connecté avec succès !",
                        timeout: 10000
                    }];
                    $rootScope.updateMessageOfTheDay();
                    $location.path(CONFIG.mainPage);
                }
            }
        );
    };

    $rootScope.updateMessageOfTheDay = function(){
        Files.getFileContent("/etc/motd", false).then(
            function(content){
                $rootScope.messageOfTheDay = content.data;
            },
            function(err){
                console.error(err);
                alert('Impossible de lire le fichier /etc/motd');
            }
        )
    }

    if(CONFIG.autoLogin){
        $rootScope.login();
    }
};
