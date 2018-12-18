'use strict';

const http = require('http');
const https = require('https');
const url = require('url');

const httpRequest = http.request;
const httpsRequest = https.request;

module.exports = function() {
  return {
    name: 'http',
    handler: function(asyncContext, next) {
      http.request = !asyncContext.get() || !asyncContext.get().enabled ? httpRequest : function(options, callback) {
        if (!asyncContext.get() || !options.uri) {
          return httpRequest.call(http, options, callback);
        }

        const query = `${options.method} ${url.format(options.uri)}`;
        const timing = asyncContext.get().startTimeQuery('http', query);

        function wrappedCallback(res) {
          res.on('end', function stopTiming() {
            asyncContext.get().stopTimeQuery(timing);
            res.removeListener('end', stopTiming);
          });

          if (callback)
            callback.apply(null, arguments);
        }

        const request = httpRequest.call(http, options, wrappedCallback);
        request.on('error', () => asyncContext.get().stopTimeQuery(timing));

        return request;
      };

      if (Number(process.versions.node.split('.')[0]) >= 11) {
        https.request = !asyncContext.get() || !asyncContext.get().enabled ? httpsRequest : function(options, callback) {
          if (!asyncContext.get() || !options.uri) {
            return httpsRequest.call(http, options, callback);
          }

          const query = `${options.method} ${url.format(options.uri)}`;
          const timing = asyncContext.get().startTimeQuery('http', query);

          function wrappedCallback(res) {
            res.on('end', function stopTiming() {
              asyncContext.get().stopTimeQuery(timing);
              res.removeListener('end', stopTiming);
            });

            if (callback)
              callback.apply(null, arguments);
          }

          const request = httpsRequest.call(http, options, wrappedCallback);
          request.on('error', () => asyncContext.get().stopTimeQuery(timing));

          return request;
        };
      }

      next();
    }
  };
};
