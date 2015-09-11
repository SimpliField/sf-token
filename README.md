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
    }).catch((err) => {
      // Refuse access
    });
});

```

Note that this only verify the hash and its validity regarding to the current
 time. You'll have to manage persistence yourself.

## Modules
 <dl>
 <dt><a href="#module_sf-token">sf-token</a></dt>
 <dd></dd>
 </dl>
 ## Classes
 <dl>
 <dt><a href="#TokenService">TokenService</a></dt>
 <dd></dd>
 </dl>
 <a name="module_sf-token"></a>
 ## sf-token
 **Api**: public  
 <a name="TokenService"></a>
 ## TokenService
 **Kind**: global class  
 **Api**: public  

 * [TokenService](#TokenService)
   * [new TokenService()](#new_TokenService_new)
   * [.createToken](#TokenService+createToken) ⇒ <code>Object</code>
   * [.checkToken](#TokenService+checkToken) ⇒ <code>void</code>
   * [.createHash](#TokenService+createHash) ⇒ <code>String</code>

 <a name="new_TokenService_new"></a>
 ### new TokenService()
 Create a new TokenService instance

 **Returns**: <code>Object</code> - A TokenService instance  
 **Throws**:

 - <code>YError(E_BAD_SECRET)</code> If there is no secret given
 - <code>YError(E_NO_ID_GENERATOR)</code> If there is no id generator available
 - <code>YError(E_BAD_TIME)</code> If the given time function is not right
 - <code>YError(E_BAD_ALGORITHM)</code> If the given algorithm is not supported


 | Param | Type | Description |
 | --- | --- | --- |
 | options.secret | <code>String</code> | Some salt for hash |
 | options.uniqueId | <code>function</code> | A unique id generator |
 | options.time | <code>function</code> | A time function (defaults to Date.now()) |
 | options.algorithm | <code>String</code> | Algorithm to use (default to 'sha256') |

 **Example**  
 ```js
 let tk = new TokenService({
     secret: 'mysecret',
     uniqueId: createObjectId,
     time: Date.now.bind(Date),
     algorithm: 'md5',
   });
 ```
 <a name="TokenService+createToken"></a>
 ### tokenService.createToken ⇒ <code>Object</code>
 Create a new token and return it envelope

 **Kind**: instance property of <code>[TokenService](#TokenService)</code>  
 **Returns**: <code>Object</code> - The token envelope.  
 **Throws**:

 - <code>YError(E_NO_CONTENT)</code> If there is no content
 - <code>YError(E_NO_END_OF_LIFE)</code> If there is no end of life
 - <code>YError(E_PAST_END_OF_LIFE)</code> If the end of life is past

 **Api**: public  

 | Param | Type | Description |
 | --- | --- | --- |
 | contents | <code>Object</code> | Some JSON serializable content. |
 | endOfLife | <code>Number</code> | The time when the token is outdated. |

 **Example**  
 ```js
 tk.createToken({
   uri: '/plop'
 }, Date.now() + 3600000);
 // {
 //   _id: 'abbacacaabbacacaabbacaca',
 //   endOfLife: 1441981754461,
 //   hash: '13371ee713371ee713371ee7',
 //   contents: { uri: '/plop' },
 // }
 ```
 <a name="TokenService+checkToken"></a>
 ### tokenService.checkToken ⇒ <code>void</code>
 Check a token envelope against a given hash

 **Kind**: instance property of <code>[TokenService](#TokenService)</code>  
 **Throws**:

 - <code>YError(E_NO_HASH)</code> If there is no hash
 - <code>YError(E_NO_ID)</code> If there is no id
 - <code>YError(E_NO_CONTENT)</code> If there is no content
 - <code>YError(E_NO_END_OF_LIFE)</code> If there is no end of life
 - <code>YError(E_BAD_HASH)</code> If the hash do not match
 - <code>YError(E_PAST_END_OF_LIFE)</code> If the end of life is past

 **Api**: public  

 | Param | Type | Description |
 | --- | --- | --- |
 | envelope._id | <code>String</code> | The token id |
 | envelope.endOfLife | <code>Number</code> | The token validity |
 | envelope.contents | <code>Object</code> | The token contents |
 | hash | <code>String</code> | The given hash to check against |

 **Example**  
 ```js
 tk.checkToken({
 //   _id: 'abbacacaabbacacaabbacaca',
 //   endOfLife: 1441981754461,
 //   contents: { uri: '/plop' },
 }, '13371ee713371ee713371ee7');
 ```
 <a name="TokenService+createHash"></a>
 ### tokenService.createHash ⇒ <code>String</code>
 Create a hash from the given envelope

 **Kind**: instance property of <code>[TokenService](#TokenService)</code>  
 **Returns**: <code>String</code> - The resulting hash  
 **Api**: private  

 | Param | Type | Description |
 | --- | --- | --- |
 | envelope._id | <code>String</code> | The token id |
 | envelope.endOfLife | <code>Number</code> | The token validity |
 | envelope.contents | <code>Object</code> | The token contents |
