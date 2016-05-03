'use strict';

describe("Service ajax module", function() {
    it("contains a function to get ...", function() {
        expect(true).toBe(true);
    });
    it("contains a function to delete ...", function(){

    })
});


describe('Controller: LoginCtrl', function () {

    // load the controller's module
    beforeEach(module('RDash'/*, ['ui.bootstrap', 'ui.router', 'ngCookies', 'timer']*/));

    var LoginCtrl,
    scope, service;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope, _User_) {
        scope = $rootScope.$new();
        LoginCtrl = $controller('LoginCtrl', {
            $scope: scope
        });
        service = _User_;
    }));

    it('Connection', function () {
        service.connect({});
    });

    it('Login', function () {
        scope.login();

        console.log(scope);
        var authenticated = false;
        /*setInterval(function () {authenticated = scope.authenticated}, 1000);

        waitsFor( function () {return !authenticated}, "Loitered too long", 1200);*/

        //setInterval(function () {authenticated = scope.connectionProcessing}, 1000);
        scope.$digest();
        expect(scope.connectionProcessing).toBe(false);

        //while(authenticated)

        /* while(scope.connectionProcessing){
          scope.$digest();
        }

        ///scope.$watch(scope.connectionProcessing, function(res){
          expect(scope.connectionProcessing).toBe(false);
        //});*/
    });
});
