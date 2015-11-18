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
            .state('index', {
                url: '/',
                templateUrl: 'templates/login.html'
            })
            .state('dashboard', {
                url: '/dashboard',
                templateUrl: 'templates/dashboard.html'
            })
            .state('jobs', {
                url: '/jobs',
                templateUrl: 'templates/jobs.html'
            })
            .state('nodes', {
                url: '/nodes',
                templateUrl: 'templates/nodes.html'
            })
            .state('files', {
                url: '/browser',
                templateUrl: 'templates/browser.html'
            });
    }
]);
