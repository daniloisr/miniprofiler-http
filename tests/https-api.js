'use strict';

let https = require('https');
let fs = require('fs');

let options = {
  key: fs.readFileSync('./tests/ssl/key.pem'),
  cert: fs.readFileSync('./tests/ssl/cert.pem')
};

let server = https.createServer(options, (req, res) => {
  res.end('It Works!');
});

module.exports = server;