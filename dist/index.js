'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _yerror = require('yerror');

var _yerror2 = _interopRequireDefault(_yerror);

var TokenService = (function () {
  function TokenService(_ref) {
    var secret = _ref.secret;
    var uniqueId = _ref.uniqueId;
    var time = _ref.time;
    var algorithm = _ref.algorithm;

    _classCallCheck(this, TokenService);

    if ('string' !== typeof secret) {
      throw new _yerror2['default']('E_BAD_SECRET', typeof secret);
    }
    if (!uniqueId) {
      throw new _yerror2['default']('E_NO_ID_GENERATOR', uniqueId);
    }
    if (!(uniqueId instanceof Function)) {
      throw new _yerror2['default']('E_BAD_ID_GENERATOR', typeof uniqueId, uniqueId);
    }
    if (time && !(time instanceof Function)) {
      throw new _yerror2['default']('E_BAD_time', typeof time, time);
    }
    if (algorithm) {
      var algorithms = _crypto2['default'].getHashes();

      if (-1 === algorithms.indexOf(algorithm)) {
        throw new _yerror2['default']('E_BAD_ALGORITHM', algorithm, algorithms);
      }
    }
    this.uniqueId = uniqueId;
    this.secret = secret;
    this.time = time || Date.now.bind(Date);
    this.algorithm = algorithm || 'sha256';
  }

  _createClass(TokenService, [{
    key: 'createToken',
    value: function createToken(contents, endOfLife) {
      var _id = this.uniqueId();
      var timestamp = this.time();
      var hash = '';

      if ('undefined' === typeof contents) {
        throw new _yerror2['default']('E_NO_CONTENT', typeof contents);
      }
      if ('number' !== typeof endOfLife) {
        throw new _yerror2['default']('E_NO_END_OF_LIFE', typeof endOfLife, endOfLife);
      }
      hash = this._createHash({ _id: _id, endOfLife: endOfLife, contents: contents });
      if (timestamp > endOfLife) {
        throw new _yerror2['default']('E_PAST_END_OF_LIFE', endOfLife, timestamp);
      }

      return {
        _id: _id,
        hash: hash,
        endOfLife: endOfLife,
        contents: contents
      };
    }
  }, {
    key: 'checkToken',
    value: function checkToken(_ref2, hash) {
      var _id = _ref2._id;
      var endOfLife = _ref2.endOfLife;
      var contents = _ref2.contents;

      var timestamp = this.time();
      var computedHash = '';

      if ('string' !== typeof hash) {
        throw new _yerror2['default']('E_NO_HASH', typeof hash);
      }
      if ('string' !== typeof _id) {
        throw new _yerror2['default']('E_NO_ID', typeof _id);
      }
      if (!contents) {
        throw new _yerror2['default']('E_NO_CONTENT', typeof token);
      }
      if ('number' !== typeof endOfLife) {
        throw new _yerror2['default']('E_NO_END_OF_LIFE', typeof endOfLife, endOfLife);
      }
      computedHash = this._createHash({ _id: _id, endOfLife: endOfLife, contents: contents });
      if (hash !== computedHash) {
        throw new _yerror2['default']('E_BAD_HASH', hash, computedHash);
      }
      if (timestamp > endOfLife) {
        throw new _yerror2['default']('E_PAST_END_OF_LIFE', endOfLife, timestamp);
      }
    }
  }, {
    key: '_createHash',
    value: function _createHash(_ref3) {
      var _id = _ref3._id;
      var endOfLife = _ref3.endOfLife;
      var contents = _ref3.contents;

      return _crypto2['default'].createHash(this.algorithm).update([_id, endOfLife, JSON.stringify(contents), this.secret].join(':')).digest('hex');
    }
  }]);

  return TokenService;
})();

exports['default'] = TokenService;
module.exports = exports['default'];