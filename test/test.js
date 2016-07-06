var chai = require('chai');
var expect = chai.expect;
var tracker = require('../index.js')

describe("index.js", function(){
  describe("#getBidIndex", function(){
    it("should have correct return structure", function(){
      return tracker.getBidIndex("sgdq2015").then(function(data){
        expect(data).to.be.ok;
      });
    });
  });

  describe("#getBidDetail", function() {
    it("should get data", function() {
      return tracker.getBidDetail(4467).then(function(data){
        expect(data).to.be.ok;
      })
    })
  });
});