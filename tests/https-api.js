'use strict';

const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('./tests/ssl/key.pem'),
  cert: fs.readFileSync('./tests/ssl/cert.pem')
};

const server = https.createServer(options, (req, res) => {
  res.end('It Works!');
});

module.exports = server;
