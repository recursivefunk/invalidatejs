'use strict';

/*global require:false module:false Buffer:false*/

var request = require('npm');
var parser = require('libxml-to-js');
var util = require('util');
var request = require('request');
var crypto = require('crypto');
var sf = require('sf');
var builder = require('xmlbuilder');
var aws_host = 'cloudfront.amazonaws.com';
var required = ['secret_key', 'access_key', 'dist', 'resourcePaths'];

module.exports = function invalidate(opts, callback) {
  var missing = checkRequired(opts);
  if (missing.length > 0) {
    return callback(new Error('Missing the following required config itmes ' + util.inspect(missing)));
  } else {
    var requestToSend = buildRequest(opts);
    request.post(requestToSend, function (err, resp, body) {
      if (err) {
        return callback(err);
      }

      parser(body, function (error, result) {
        if (result.Error) {
          error = error || new Error(result.Error.message);
        }
        return callback(error, resp.statusCode, result);
      });
    });
  }
};

function checkRequired(opts) {
  var missing = [];
  required.forEach(function (r) {
    if (!opts[r]) {
      missing.push(r);
    }
  });
  return missing;
}

function buildRequest(opts) {
  var resources = opts.resourcePaths;
  var doc = builder.create();
  var batch = doc.begin('InvalidationBatch');
  var body;
  var headers;

  resources.forEach(function (r) {
    batch.ele('Path', {}, r);
  });

  batch.ele('CallerReference', {} , opts.dist + Date.now());
  body = doc.toString('utf8');
  headers = fetchHeaders(opts, body.length);
  var endpoint = 
    sf('https://{0}/2010-11-01/distribution/{1}/invalidation', aws_host, opts.dist);

  return {
    uri: endpoint,
    headers: headers,
    body: body
  };
}

function fetchHeaders(opts, contentLength) {
  var date = new Date().toGMTString();
  var hash = 
    crypto
    .createHmac('sha1', opts.secret_key)
    .update(date, 'utf8')
    .digest('binary');
  var b64 = new Buffer(hash, 'binary').toString('base64');
  var auth = 'AWS ' + opts.access_key + ':' + b64;

  return {
    'Host': aws_host,
    'Method': 'POST',
    'Date': date,
    'x-amz-date': date,
    'Content-Type': 'text/xml; charset=UTF-8',
    'Authorization': auth,
    'Content-Length': contentLength
  };
}
