'use strict';

/**
 * Route configuration for the RDash module.
 */
angular.module('RDash').config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {

        // For unmatched routes
        $urlRouterProvider.otherwise('/');

        // Application routes
        $stateProvider
            .state('authentication', {
                url: '/',
                templateUrl: 'templates/login.html',
                authenticate: false
            })
            .state('dashboard', {
                url: '/dashboard',
                templateUrl: 'templates/dashboard.html',
                authenticate: true
            })
            .state('jobs', {
                url: '/jobs',
                templateUrl: 'templates/jobs.html',
                authenticate: true,
            })
            .state('nodes', {
                url: '/nodes',
                templateUrl: 'templates/nodes.html',
                authenticate: true,
            })
            .state('files', {
                url: '/browser',
                templateUrl: 'templates/browser.html',
                authenticate: true,
            });
    }
]);

angular.module('RDash').run(['User','$state', '$rootScope',
    function(User, $state, $rootScope){
        // On root change
        $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams){
            // Check authentication
            if (toState.authenticate && !User.isAuthenticated()){
                $state.transitionTo("authentication");
                event.preventDefault();
            }

            // Already authenticated
            if(toState.name == "authentication" && User.isAuthenticated()){
                $state.transitionTo("dashboard");
                event.preventDefault();
            }
        });
    }
]);
