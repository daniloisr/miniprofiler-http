'use strict';

var http = require('http');

var httpRequest;

module.exports = function() {
  httpRequest = httpRequest || http.request;

  return {
    name: 'http',
    handler: function(req, res, next) {

      http.request = !req.miniprofiler || !req.miniprofiler.enabled ? httpRequest : function(options, callback) {
        httpRequest.call(this, options, callback);
      };

      next();
    }
  };
};