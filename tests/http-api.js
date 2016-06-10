'use strict';

let http = require('http');

let server = http.createServer((req, res) => {
  res.end('It Works!');
});

module.exports = server;