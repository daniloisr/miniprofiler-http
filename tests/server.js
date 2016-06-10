'use strict';

let miniprofiler = require('miniprofiler');
let http = require('http');
let request = require('request');

let endpoints = {
  'http': 'http://localhost:9080',
  'https': 'https://localhost:9443'
};

let server = http.createServer((req, res) => {
  miniprofiler.express((req, res) => { return !req.url.startsWith('/unprofiled'); })(req, res, () => {
    require('../index.js')().handler(req, res, () => {

      for(let protocol in endpoints) {

        if (req.url == `/${protocol}/send-get`) {
          request(`${endpoints[protocol]}/api/ping`, function(error, response, body) {
            res.end(body);
          });
        }

        if (req.url == `/${protocol}/send-post`) {
          request.post(`${endpoints[protocol]}/api/ping`, function(error, response, body) {
            res.end(body);
          });
        }

        if (req.url == `/unprofiled/${protocol}/send-get`) {
          request(`${endpoints[protocol]}/api/ping`, function(error, response, body) {
            res.end(body);
          });
        }

      }

    });
  });
});

server.endpoints = endpoints;
module.exports = server;