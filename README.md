## No longer maintained. Other modules handle this and much more

# invalidatejs

## Sends invalidation requests to Amazon's CloudFront Service


### Install
```
npm install invalidatejs
```

### Usage
```javascript

  var invalidate = require('invalidatejs');

  var config = {
    resourcePaths: ["/jquery.js", "/custom.js"],
    secret_key: "mY$ecretKEY",
    access_key: "accesskey",
    dist: "target_distribution"
  };

  invalidate(config, function (err, statusCode, body) {

    /*
      err - an error occured of course!
      statusCode - status code returned from the post request to AWS
      body - body of the response from AWS in JSON form
    */

  });

```
