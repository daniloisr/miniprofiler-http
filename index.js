'use strict';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

let http = require('http');
let url = require('url');

let httpRequest = http.request;

module.exports = function() {
  return {
    name: 'http',
    handler: function(req, res, next) {
      http.request = !req.miniprofiler || !req.miniprofiler.enabled ? httpRequest : function(options, callback) {
        if (!req.miniprofiler) {
          return httpRequest.call(http, options, callback);
        }

        let query = `${options.method} ${url.format(options.uri)}`;
        let timing = req.miniprofiler.startTimeQuery('http', query);

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