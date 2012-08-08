'use strict';

/*global require:false module:false Buffer:false*/

var request = require('npm');
var parser = require('libxml-to-js');
var util = require('util');
var request = require('request');
var crypto = require('crypto');
var sf = require('sf');
var protocol = 'https://';
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
  var resources = buildXmlResourcePaths(opts.resourcePaths);
  var str = '<InvalidationBatch>';
  var headers;

  resources.forEach(function (r) {
    str += r;
  });

  str += sf('<CallerReference>{0}{1}</CallerReference>', opts.dist, Date.now());
  str += '</InvalidationBatch>';
  headers = fetchHeaders(opts, str.length);
  var endpoint = sf('{0}{1}/2010-11-01/distribution/{2}/invalidation', protocol, aws_host, opts.dist);

  return {
    uri: endpoint,
    headers: headers,
    body: str
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
  var auth = sf('AWS ' + opts.access_key + ':' + b64);

  return {
    'Host': 'cloudfront.amazonaws.com',
    'Method': 'POST',
    'Date': date,
    'x-amz-date': date,
    'Content-Type': 'text/xml; charset=UTF-8',
    'Authorization': auth,
    'Content-Length': sf('{0}', contentLength)
  };
}

function buildXmlResourcePaths (resourcePaths) {
  var paths = [];
  resourcePaths.forEach(function (_path) {
    paths.push( sf('<Path>{0}</Path>', _path) );
  });
  return paths;
}