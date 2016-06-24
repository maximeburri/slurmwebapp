var inputs = require(browser.params.inputFile);
var serverConfig = require(inputs.serverConfig);

var username = element(by.model('user.username'));
var password = element(by.model('user.password'));
var bridge = element(by.model('user.bridge'));
var cluster = element(by.model('user.cluster'));
var loadingConnection = element(by.css('.fa-circle-o-notch'));
var body = element(by.css('body'));


// If not ignore synchronization,
// browser.wait wait for $timeout
// And have $timeout to close alerts
browser.ignoreSynchronization = true;

// Check good credentials
if(inputs.credentials.cluster == "<enter the cluster name>" ||
   inputs.credentials.username == "<enter the username>" ||
   inputs.credentials.password == "<enter the password>"){
   throw "Please enter credentials in tests/inputs/default.js";
}

connectionLoadingFinish = function(){
    return browser.wait(function() {
        // Get $rootscope.connectionProcessing
        return body.evaluate("connectionProcessing").then(
            function(connectionProcessing) {
                //console.log(connectionProcessing);
                return !connectionProcessing;
            }
        )
    })
}

// Login with credentials
login = function(usernameValue, passwordValue, bridgeValue, clusterValue){
    username.clear();
    username.sendKeys(usernameValue);

    password.clear();
    password.sendKeys(passwordValue);

    bridge.clear();
    bridge.sendKeys(bridgeValue);

    cluster.clear();
    cluster.sendKeys(clusterValue);

    cluster.submit();

    expect(loadingConnection.isPresent()).toBe(true);

    return connectionLoadingFinish();
}

// Good login
goodLogin = function(){
    return login(inputs.credentials.username,
          inputs.credentials.password,
          inputs.credentials.bridge,
          inputs.credentials.cluster);
}

module.exports = {
    login : login,
    goodLogin : goodLogin,
    inputs : inputs,
    serverConfig : serverConfig
}
