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
          promise.emit('success', {err:err, statusCode:statusCode, body:body});
        });
        return promise;
      },

      'no error occured': function (obj) {
        assert.isNull(obj.err);
      },

      'status code is correct': function (obj) {
        assert.equal(obj.statusCode, 201);
      },

      'response indicates invalidation in progress': function (obj) {
        assert.equal(obj.body.Status, 'InProgress');
        assert.isNotNull(obj.body.Id);
      }
    }
  }
}).export(module);

