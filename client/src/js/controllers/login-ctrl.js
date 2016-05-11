/**
 * Master Controller
 */

angular.module('RDash')
    .controller('LoginCtrl', ['$rootScope', '$location', '$cookieStore', 'User','Files', LoginCtrl]);

function LoginCtrl($rootScope, $location, $cookieStore, User, Files) {
    if($rootScope.authenticated == undefined){
        $rootScope.connectionProcessing = false;
        $rootScope.authenticated = false;
        $rootScope.connection = {error:{}};
        $rootScope.messageOfTheDay = "Aucun message";

        // Default input
        $rootScope.user = {
            username : "burrimax",
            password : "FERMO3rt",
            cluster  : "baobab.unige.ch",
            bridge   : "127.0.0.1:3000",//129.194.185.74
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
                console.log("Failed message "+failMessage)
                if(failMessage == "socket-timeout")
                    $rootScope.connection.error.isBridge = true;
                else if(failMessage == "client-authentication")
                    $rootScope.connection.error.isAuthentication = true;
                else if(failMessage == "ssh-connection")
                    $rootScope.connection.error.isCluster = true;
                else if(failMessage == "disconnect"){
                    $rootScope.connection.error.bridgeDisconnected = true;
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
                    $location.path('/dashboard');
                    $location.path('/submission');
                }
            }
        );
    };

    $rootScope.login();

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
};
