import crypto from 'crypto';
import YError from 'yerror';

class TokenService {
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
  constructor({
    secret,
    uniqueId,
    time,
    algorithm,
  }) {

    if('string' !== typeof secret) {
      throw new YError('E_BAD_SECRET', typeof secret);
    }
    if(!uniqueId) {
      throw new YError('E_NO_ID_GENERATOR', uniqueId);
    }
    if(!(uniqueId instanceof Function)) {
      throw new YError('E_BAD_ID_GENERATOR', typeof uniqueId, uniqueId);
    }
    if(time && !(time instanceof Function)) {
      throw new YError('E_BAD_TIME', typeof time, time);
    }
    if(algorithm) {
      let algorithms = crypto.getHashes();

      if(-1 === algorithms.indexOf(algorithm)) {
        throw new YError('E_BAD_ALGORITHM', algorithm, algorithms);
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
  createToken(contents, endOfLife) {
    let _id = this.uniqueId();
    let timestamp = this.time();
    let hash = '';

    if('undefined' === typeof contents) {
      throw new YError('E_NO_CONTENT', typeof contents);
    }
    if('number' !== typeof endOfLife) {
      throw new YError('E_NO_END_OF_LIFE', typeof endOfLife, endOfLife);
    }
    hash = this._createHash({ _id, endOfLife, contents });
    if(timestamp > endOfLife) {
      throw new YError('E_PAST_END_OF_LIFE', endOfLife, timestamp);
    }

    return {
      _id,
      hash,
      endOfLife,
      contents,
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
  checkToken({ _id, endOfLife, contents }, hash) {
    let timestamp = this.time();
    let computedHash = '';

    if('string' !== typeof hash) {
      throw new YError('E_NO_HASH', typeof hash);
    }
    if('string' !== typeof _id) {
      throw new YError('E_NO_ID', typeof _id);
    }
    if(!contents) {
      throw new YError('E_NO_CONTENT', typeof token);
    }
    if('number' !== typeof endOfLife) {
      throw new YError('E_NO_END_OF_LIFE', typeof endOfLife, endOfLife);
    }
    computedHash = this._createHash({ _id, endOfLife, contents });
    if(hash !== computedHash) {
      throw new YError('E_BAD_HASH', hash, computedHash);
    }
    if(timestamp > endOfLife) {
      throw new YError('E_PAST_END_OF_LIFE', endOfLife, timestamp);
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
  _createHash({ _id, endOfLife, contents }) {
    return crypto
      .createHash(this.algorithm)
      .update([_id, endOfLife, JSON.stringify(contents), this.secret].join(':'))
      .digest('hex');
  }
}


/**
 * @module sf-token
 * @api public
 */
export default TokenService;
