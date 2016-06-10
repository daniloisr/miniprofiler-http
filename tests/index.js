'use strict';

let expect = require('chai').expect;
let request = require('request');
let server = require('./server');
let httpApiServer = require('./http-api.js');
let httpsApiServer = require('./https-api.js');

describe('HTTP / HTTPS Tests', function() {

  before((done) => {
    let count = 3;
    let finished = (done) => { if (--count === 0) done(); };
    server.listen(8080, finished.bind(this, done));
    httpApiServer.listen(9080, finished.bind(this, done));
    httpsApiServer.listen(9443, finished.bind(this, done));
  });

  after((done) => {
    let count = 3;
    let finished = (done) => { if (--count === 0) done(); };
    server.close(finished.bind(this, done));
    httpApiServer.close(finished.bind(this, done));
    httpsApiServer.close(finished.bind(this, done));
  });

  for (let protocol in server.endpoints) {

    it(`[${protocol}] should profile a GET request to API`, function(done) {
      request(`http://localhost:8080/${protocol}/send-get`, (err, response, body) => {
        let ids = JSON.parse(response.headers['x-miniprofiler-ids']);
        expect(ids).to.have.lengthOf(1);
        expect(body).to.be.equal('It Works!');

        request.post({url: 'http://localhost:8080/mini-profiler-resources/results/', form: { id: ids[0], popup: 1 } }, (err, response, body) => {
          let result = JSON.parse(body);

          expect(result.Root.CustomTimings).to.have.property('http');
          expect(result.Root.CustomTimings.http).to.have.lengthOf(1);

          expect(result.Root.CustomTimings.http[0].ExecuteType).to.be.equal('http');
          expect(result.Root.CustomTimings.http[0].CommandString).to.be.equal(`GET ${server.endpoints[protocol]}/api/ping`);
          done();
        });
      });
    });

    it(`[${protocol}] should profile a POST request to API`, function(done) {
      request(`http://localhost:8080/${protocol}/send-post`, (err, response, body) => {
        let ids = JSON.parse(response.headers['x-miniprofiler-ids']);
        expect(ids).to.have.lengthOf(1);
        expect(body).to.be.equal('It Works!');

        request.post({url: 'http://localhost:8080/mini-profiler-resources/results/', form: { id: ids[0], popup: 1 } }, (err, response, body) => {
          let result = JSON.parse(body);
          expect(result.Root.CustomTimings).to.have.property('http');
          expect(result.Root.CustomTimings.http).to.have.lengthOf(1);

          expect(result.Root.CustomTimings.http[0].ExecuteType).to.be.equal('http');
          expect(result.Root.CustomTimings.http[0].CommandString).to.be.equal(`POST ${server.endpoints[protocol]}/api/ping`);
          done();
        });
      });
    });

    it(`[${protocol}] should not break http requests to unprofiled routes`, function(done) {
      request(`http://localhost:8080/unprofiled/${protocol}/send-get`, (err, response, body) => {
        expect(response.headers).to.not.include.keys('x-miniprofiler-ids');
        expect(body).to.be.equal('It Works!');
        done();
      });
    });

    it(`[${protocol}] should not break http requests to unprofiled routes`, function(done) {
      request(`http://localhost:8080/unprofiled/${protocol}/send-get`, (err, response, body) => {
        expect(response.headers).to.not.include.keys('x-miniprofiler-ids');
        expect(body).to.be.equal('It Works!');
        done();
      });
    });

  }
});
