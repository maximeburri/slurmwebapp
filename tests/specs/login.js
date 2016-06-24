var common = require("../common.js");
var inputs = common.inputs;
var serverConfig = common.serverConfig;

var alerts = element.all(by.repeater('alert in alerts'));
var body = element(by.css('body'));

describe('Login', function() {
    beforeEach(function(){
        browser.get(inputs.clientWebsite);
    });

    it('should have bad bridge', function() {
        common.login(inputs.credentials.username,
              inputs.credentials.password,
              "unknow-bridge.ch",
              inputs.credentials.cluster)
            .then(function(){
                expect(body.evaluate("connection.error.isBridge")).toBe(true);
            });
    });

    if(serverConfig.connection.accepted_clusters !== undefined){
        it('should have cluster not whitelisted', function() {
            common.login(inputs.credentials.username,
                  inputs.credentials.password,
                  inputs.credentials.bridge,
                  "unknow-custer.ch")
                .then(function(){
                    expect(body.evaluate("connection.error.isClusterRejected")).toBe(true);
                });
        });
    }else{
        console.warn("Server accept all server, impossible to make a test")
    }

    if(inputs.testBadCredentials){
        it('should have bad authentication', function() {
            common.login(inputs.credentials.username,
                  "bad",
                  inputs.credentials.bridge,
                  inputs.credentials.cluster)
                .then(function(){
                    expect(body.evaluate("connection.error.isAuthentication")).toBe(true);
                });
        });
    }else{
        console.warn("Bad credentials test disabled");
    }

    it('should have good authentication', function() {
        common.goodLogin()
            .then(function(){
                expect(alerts.count()).toEqual(1);
            });
    });
});
