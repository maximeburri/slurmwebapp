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
                authenticate: false,
                title: 'Login'
            })
            .state('dashboard', {
                url: '/dashboard',
                templateUrl: 'templates/dashboard.html',
                authenticate: true,
                title: 'Tableau de bord'
            })
            .state('jobs', {
                url: '/jobs',
                templateUrl: 'templates/jobs.html',
                authenticate: true,
                title: 'Jobs'
            })
            .state('job', {
                url: '/job/{id}',
                templateUrl: 'templates/job.html',
                authenticate: true,
                title: 'Job {{job.id}}'
            })
            .state('nodes', {
                url: '/nodes',
                templateUrl: 'templates/nodes.html',
                authenticate: true,
                title: 'Noeuds'
            })
            .state('files', {
                url: '/browser',
                templateUrl: 'templates/browser.html',
                authenticate: true,
                title: 'Navigateur de fichiers'
            });
    }
]);

angular.module('RDash').run(['User','$state', '$rootScope',
    function(User, $state, $rootScope){
        // On route change
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

        // On state change success
        $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
            // Update title
            $rootScope.titlePage = toState.title;
        });
    }
]);
