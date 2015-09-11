import crypto from 'crypto';
import YError from 'yerror';

export default class TokenService {
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
      throw new YError('E_BAD_time', typeof time, time);
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
  _createHash({ _id, endOfLife, contents }) {
    return crypto
      .createHash(this.algorithm)
      .update([_id, endOfLife, JSON.stringify(contents), this.secret].join(':'))
      .digest('hex');
  }
}
