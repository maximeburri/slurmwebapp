var expect  = require("chai").expect;
var inputs = require("../inputs.js");

var JobObject = require("../../objects/JobObject.js");
var jobObject = new JobObject();

describe("Job operations", function() {
  describe("Parsing", function() {
    it("parse job detail command", function() {
        jobObject.operations.detail.parseScontrolShowJob(
            inputs.job.detail.stringResult,
            /*exit code*/
            0,
            /*result */
            function(data, error){
                expect(data).to.deep.equal(inputs.job.detail.objectResult);
            }
        );
    });

    it("parse job estimation command", function() {
        jobObject.operations.estimate.parseSrunTestOnly(
            inputs.job.estimation.stringResult,
            /*exit code*/
            0,
            /*result */
            function(data, error){
                expect(data).to.deep.equal(inputs.job.estimation.objectResult);
            }
        );
    });
  });
});
