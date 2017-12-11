'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _yerror = require('yerror');

var _yerror2 = _interopRequireDefault(_yerror);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TokenService = function () {
  /**
   * Create a new TokenService instance
   * @constructs TokenService
   * @param  {String} options.secret    Some salt for hash
   * @param  {Function} options.uniqueId  A unique id generator
   * @param  {Function} options.time      A time function (defaults to Date.now())
   * @param  {String} options.algorithm Algorithm to use (default to 'sha256')
   * @return {Object}                   A TokenService instance
   * @throws {YError(E_BAD_SECRET)} If there is no secret given
   * @throws {YError(E_NO_ID_GENERATOR)} If there is no id generator available
   * @throws {YError(E_BAD_TIME)} If the given time function is not right
   * @throws {YError(E_BAD_ALGORITHM)} If the given algorithm is not supported
   * @api public
   * @example
   *
   *   let tk = new TokenService({
   *     secret: 'mysecret',
   *     uniqueId: createObjectId,
   *     time: Date.now.bind(Date),
   *     algorithm: 'md5',
   *   });
   */
  function TokenService(_ref) {
    var secret = _ref.secret,
        uniqueId = _ref.uniqueId,
        time = _ref.time,
        algorithm = _ref.algorithm;

    _classCallCheck(this, TokenService);

    if ('string' !== typeof secret) {
      throw new _yerror2.default('E_BAD_SECRET', typeof secret === 'undefined' ? 'undefined' : _typeof(secret));
    }
    if (!uniqueId) {
      throw new _yerror2.default('E_NO_ID_GENERATOR', uniqueId);
    }
    if (!(uniqueId instanceof Function)) {
      throw new _yerror2.default('E_BAD_ID_GENERATOR', typeof uniqueId === 'undefined' ? 'undefined' : _typeof(uniqueId), uniqueId);
    }
    if (time && !(time instanceof Function)) {
      throw new _yerror2.default('E_BAD_TIME', typeof time === 'undefined' ? 'undefined' : _typeof(time), time);
    }
    if (algorithm) {
      var algorithms = _crypto2.default.getHashes();

      if (-1 === algorithms.indexOf(algorithm)) {
        throw new _yerror2.default('E_BAD_ALGORITHM', algorithm, algorithms);
      }
    }
    this.uniqueId = uniqueId;
    this.secret = secret;
    this.time = time || Date.now.bind(Date);
    this.algorithm = algorithm || 'sha256';
  }
  /**
   * Create a new token and return it envelope
   * @member TokenService#createToken
   * @param  {Object} contents  Some JSON serializable content.
   * @param  {Number} endOfLife The time when the token is outdated.
   * @return {Object}           The token envelope.
   * @throws {YError(E_NO_CONTENT)} If there is no content
   * @throws {YError(E_NO_END_OF_LIFE)} If there is no end of life
   * @throws {YError(E_PAST_END_OF_LIFE)} If the end of life is past
   * @api public
   * @example
   * tk.createToken({
   *   uri: '/plop'
   * }, Date.now() + 3600000);
   * // {
   * //   _id: 'abbacacaabbacacaabbacaca',
   * //   endOfLife: 1441981754461,
   * //   hash: '13371ee713371ee713371ee7',
   * //   contents: { uri: '/plop' },
   * // }
   */


  _createClass(TokenService, [{
    key: 'createToken',
    value: function createToken(contents, endOfLife) {
      var _id = this.uniqueId();
      var timestamp = this.time();
      var hash = '';

      if ('undefined' === typeof contents) {
        throw new _yerror2.default('E_NO_CONTENT', typeof contents === 'undefined' ? 'undefined' : _typeof(contents));
      }
      if ('number' !== typeof endOfLife) {
        throw new _yerror2.default('E_NO_END_OF_LIFE', typeof endOfLife === 'undefined' ? 'undefined' : _typeof(endOfLife), endOfLife);
      }
      hash = this._createHash({ _id: _id, endOfLife: endOfLife, contents: contents });
      if (timestamp > endOfLife) {
        throw new _yerror2.default('E_PAST_END_OF_LIFE', endOfLife, timestamp);
      }

      return {
        _id: _id,
        hash: hash,
        endOfLife: endOfLife,
        contents: contents
      };
    }
    /**
     * Check a token envelope against a given hash
     * @member TokenService#checkToken
     * @param  {String} envelope._id       The token id
     * @param  {Number} envelope.endOfLife The token validity
     * @param  {Object} envelope.contents  The token contents
     * @param  {String} hash              The given hash to check against
     * @returns {void}
     * @throws {YError(E_NO_HASH)} If there is no hash
     * @throws {YError(E_NO_ID)} If there is no id
     * @throws {YError(E_NO_CONTENT)} If there is no content
     * @throws {YError(E_NO_END_OF_LIFE)} If there is no end of life
     * @throws {YError(E_BAD_HASH)} If the hash do not match
     * @throws {YError(E_PAST_END_OF_LIFE)} If the end of life is past
     * @api public
     * @example
     * tk.checkToken({
     * //   _id: 'abbacacaabbacacaabbacaca',
     * //   endOfLife: 1441981754461,
     * //   contents: { uri: '/plop' },
     * }, '13371ee713371ee713371ee7');
     */

  }, {
    key: 'checkToken',
    value: function checkToken(_ref2, hash) {
      var _id = _ref2._id,
          endOfLife = _ref2.endOfLife,
          contents = _ref2.contents;

      var timestamp = this.time();
      var computedHash = '';

      if ('string' !== typeof hash) {
        throw new _yerror2.default('E_NO_HASH', typeof hash === 'undefined' ? 'undefined' : _typeof(hash));
      }
      if ('string' !== typeof _id) {
        throw new _yerror2.default('E_NO_ID', typeof _id === 'undefined' ? 'undefined' : _typeof(_id));
      }
      if (!contents) {
        throw new _yerror2.default('E_NO_CONTENT', typeof token === 'undefined' ? 'undefined' : _typeof(token));
      }
      if ('number' !== typeof endOfLife) {
        throw new _yerror2.default('E_NO_END_OF_LIFE', typeof endOfLife === 'undefined' ? 'undefined' : _typeof(endOfLife), endOfLife);
      }
      computedHash = this._createHash({ _id: _id, endOfLife: endOfLife, contents: contents });
      if (hash !== computedHash) {
        throw new _yerror2.default('E_BAD_HASH', hash, computedHash);
      }
      if (timestamp > endOfLife) {
        throw new _yerror2.default('E_PAST_END_OF_LIFE', endOfLife, timestamp);
      }
    }
    /**
     * Create a hash from the given envelope
     * @member TokenService#createHash
     * @param   {String} envelope._id       The token id
     * @param   {Number} envelope.endOfLife The token validity
     * @param   {Object} envelope.contents  The token contents
     * @returns {String}                    The resulting hash
     * @api private
     */

  }, {
    key: '_createHash',
    value: function _createHash(_ref3) {
      var _id = _ref3._id,
          endOfLife = _ref3.endOfLife,
          contents = _ref3.contents;

      return _crypto2.default.createHash(this.algorithm).update([_id, endOfLife, JSON.stringify(contents), this.secret].join(':')).digest('hex');
    }
  }]);

  return TokenService;
}();

/**
 * @module sf-token
 * @api public
 */


exports.default = TokenService;
module.exports = exports['default'];