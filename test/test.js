var fs = require('fs');
/*
  Required Configuration

  {
    "resourcePaths": ["/jquery.js", "/custom.js"],
    "secret_key": "mY$ecretKEY",
    "access_key": "accesskey",
    "dist": "target_distribution"
  }
*/

var fs = require('fs');
var invalidate = require('../index');

fs.readFile('../../json/cloudfront.json', 'utf8', function (err, data) {
  var config = JSON.parse(data);
  invalidate(config, function (err, statusCode, body) {
    console.log(body);
  });

});

