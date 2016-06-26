var common = require("../common.js");
var inputs = common.inputs;
var serverConfig = common.serverConfig;

var alerts = element.all(by.repeater('alert in alerts'));
var body = element(by.css('body'));

describe('Dashboard', function() {
    function getValue(name){
        return
            element(by.binding(name))
            .evaluate(name);
    }

    beforeEach(function(){
        browser.get(inputs.clientWebsite);
    });

    it('should have good statistics', function() {
        common.goodLogin()
            .then(function(){
                browser.wait(function() {
                    return body.evaluate("cluster").then(
                        function(cluster) {
                            return cluster !== null;
                        }
                    )
                }).then(function(){
                    expect(body.evaluate("cluster.statistics.jobs.total"))
                        .toBeGreaterThan(0);
                    expect(body.evaluate("cluster.statistics.nodes.total"))
                        .toBeGreaterThan(0);
                    expect(body.evaluate("cluster.statistics.cpus.total"))
                        .toBeGreaterThan(0);
                    expect(body.evaluate("cluster.statistics.partitions.total"))
                        .toBeGreaterThan(0);

                    // Check percentage, accept to 2 decmals (100%, 99.89%);
                    // http://regexlib.com/REDetails.aspx?regexp_id=667
                    regex = /^(100(?:\.0{1,2})?|0*?\.\d{1,2}|\d{1,2}(?:\.\d{1,2})?)%$/
                    // Node
                    expect(element.all(by.css('.legend-value')).get(0).getText()).toMatch(regex);
                    // CPus
                    expect(element.all(by.css('.legend-value')).get(1).getText()).toMatch(regex);
                });

            });
    });
});
