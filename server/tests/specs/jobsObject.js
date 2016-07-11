var expect  = require("chai").expect;
var inputs = require("../inputs.js");

var JobsObject = require("../../objects/JobsObject.js");
var jobsObject = new JobsObject();

describe("Jobs operations", function() {
  describe("Parsing", function() {
    it("parse jobs list", function() {
        list = jobsObject.operations.list.parseJobs(
            inputs.jobs.list.stringResult);
        expect(list).to.deep.equal(inputs.jobs.list.objectResult);
    });
  });
});
