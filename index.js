'use strict';

const http = require('http');
const https = require('https');
const url = require('url');

const httpRequest = http.request;
const httpsRequest = https.request;

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

        const request = httpRequest.call(http, options, wrappedCallback);
        request.on('error', () => req.miniprofiler.stopTimeQuery(timing));

        return request;
      };

      if (Number(process.versions.node.split('.')[0]) >= 11) {
        https.request = !req.miniprofiler || !req.miniprofiler.enabled ? httpsRequest : function(options, callback) {
          if (!req.miniprofiler || !options.uri) {
            return httpsRequest.call(http, options, callback);
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

          const request = httpsRequest.call(http, options, wrappedCallback);
          request.on('error', () => req.miniprofiler.stopTimeQuery(timing));

          return request;
        };
      }

      next();
    }
  };
};
