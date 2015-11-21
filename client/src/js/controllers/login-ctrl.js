/**
 * Master Controller
 */

angular.module('RDash')
    .controller('LoginCtrl', ['$rootScope', '$location', '$cookieStore', 'User', LoginCtrl]);

function LoginCtrl($rootScope, $location, $cookieStore, User) {
    if($rootScope.authenticated == undefined){
        $rootScope.connectionProcessing = false;
        $rootScope.authenticated = false;
        $rootScope.connection = {error:{}};

        // Default input
        $rootScope.user = {
            username : "",
            password : "",
            cluster  : "",
            bridge   : ""
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
                $rootScope.connectionProcessing = false;
                $rootScope.authenticated = true;
                $rootScope.user.password = "";
                $rootScope.alerts = [{
                    type: 'success',
                    msg: "Vous avez été connectez avec succès !",
                    timeout: 3000
                }];
                $location.path('/dashboard');
            },
            // Error
            function(failMessage){
                $rootScope.connectionProcessing = false;
                $rootScope.authenticated = false;
                console.log(failMessage)
                if(failMessage == "socket-timeout")
                    $rootScope.connection.error.isBridge = true;
                else if(failMessage == "client-authentication")
                    $rootScope.connection.error.isAuthentiaction = true;
                else if(failMessage == "ssh-connection")
                    $rootScope.connection.error.isCluster = true;
                else
                    alert('Unknow error');
            },
            // Progress
            function(updateMessage){
                // Socket conneciton is connected
            }
        );
    };
};
