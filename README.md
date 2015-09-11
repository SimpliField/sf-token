# sf-token
> Service for creating and checking temporary tokens.

[![NPM version](https://badge.fury.io/js/sf-token.svg)](https://npmjs.org/package/sf-token) [![Build status](https://secure.travis-ci.org/SimpliField/sf-token.svg)](https://travis-ci.org/SimpliField/sf-token) [![Dependency Status](https://david-dm.org/SimpliField/sf-token.svg)](https://david-dm.org/SimpliField/sf-token) [![devDependency Status](https://david-dm.org/SimpliField/sf-token/dev-status.svg)](https://david-dm.org/SimpliField/sf-token#info=devDependencies) [![Coverage Status](https://coveralls.io/repos/SimpliField/sf-token/badge.svg?branch=master)](https://coveralls.io/r/SimpliField/sf-token?branch=master) [![Code Climate](https://codeclimate.com/github/SimpliField/sf-token.svg)](https://codeclimate.com/github/SimpliField/sf-token)

## Usage

```js
import TokenService  from 'sf-token';
import createObjectId from 'mongodb/objectid';

// Create a token service instance
let tokenService = new TokenService({
  uniqueId: createObjectId,
  secret: 'mysecret',
});

// create a token: the content may be any JSON serializable data
let endOfLife = Date.now() + 36000;
let {hash, ...envelope} = Service.createToken({
  method: 'GET',
  uri: '/user/abbacacaabbacacaabbacaca/subscriptions/report_received',
}, endOfLife);

// `hash` is for the client, you'll need it and `_id` to check the token
// validity

// `envelope` contains the token id (`_id` key), its validity (`endOfLife` key)
// and the given contents (`contents` key), you can store it as is in your
// database

// when the user connect to a uri
myApp.get('/tokens/:_id?hash=:hash', (req, res, next) {
  getFromDb(req._id)
    .then((envelope) => {
      tokenService.checkToken(envelope, req.hash);
      // Accept access (redirection may be based on the `envelope` contents )
    }).catch(f(err) => {
      // Refuse access
    });
});

```

Note that this only verify the hash and its validity regarding to the current
 time. You'll have to manage persistence yourself.
