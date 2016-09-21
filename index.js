'use strict';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

const http = require('http');
const url = require('url');

const httpRequest = http.request;

module.exports = function() {
  return {
    name: 'http',
    handler: function(req, res, next) {
      http.request = !req.miniprofiler || !req.miniprofiler.enabled ? httpRequest : function(options, callback) {
        if (!req.miniprofiler || !options.uri) {
          return httpRequest.call(http, options, callback);
        }

        const query = `${options.method} ${url.format(options.uri)}`;
        const timing = req.miniprofiler.startTimeQuery('http', query);

        function wrappedCallback(res) {
          res.on('end', function stopTiming() {
            req.miniprofiler.stopTimeQuery(timing);
            res.removeListener('end', stopTiming);
          });

          if (callback)
            callback.apply(null, arguments);
        }

        return httpRequest.call(http, options, wrappedCallback);
      };

      next();
    }
  };
};
