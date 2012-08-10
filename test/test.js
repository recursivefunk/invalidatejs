'use strict';
/*global require:false module:false console:false*/

var vows = require('vows');
var fs = require('fs');
var sf = require('sf');
var events = require('events');
var assert = require('assert');
var invalidate = require('../index');
var assert = require('assert');

vows.describe('Invalidator').addBatch({
  'Using the invalidator': {

    'the response from the request': {
      
      topic: function () {
        var file = fs.readFileSync('../../json/cloudfront.json', 'utf8');
        var promise = new events.EventEmitter();
        var config = JSON.parse(file);

        invalidate(config, function (err, statusCode, body) {
          promise.emit('success', err, statusCode, body);
        });
        return promise;
      },

      'no error occured': function (err, statusCode, body) {
        assert.isNull(err);
      },

      'status code is correct': function (err, statusCode, body) {
        assert.equal(statusCode, 201);
      },

      'response indicates invalidation in progress': function (err, statusCode, body) {
        assert.equal(body.Status, 'InProgress');
        assert.isNotNull(body.Id);
      }
    }
  }
}).export(module);

