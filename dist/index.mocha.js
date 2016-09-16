'use strict';

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _neatequal = require('neatequal');

var _neatequal2 = _interopRequireDefault(_neatequal);

var _sfTimeMock = require('sf-time-mock');

var _sfTimeMock2 = _interopRequireDefault(_sfTimeMock);

var _objectidStub = require('objectid-stub');

var _objectidStub2 = _interopRequireDefault(_objectidStub);

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var time = (0, _sfTimeMock2.default)(); /* eslint max-nested-callbacks:[1] */

var createObjectId = (0, _objectidStub2.default)();

describe('TokenService', function () {

  beforeEach(function () {
    createObjectId.reset();
    time.setTime(1267833600000);
  });

  describe('constructor()', function () {

    it('should work with required options only', function () {
      new _index2.default({
        secret: 'mysecret',
        uniqueId: createObjectId
      });
    });

    it('should work with all options', function () {
      new _index2.default({
        secret: 'mysecret',
        uniqueId: createObjectId,
        time: time,
        algorithm: 'md5'
      });
    });

    it('should fail if no unique id generator is given', function () {
      _assert2.default.throws(function () {
        new _index2.default({
          secret: 'mysecret'
        });
      }, /E_NO_ID_GENERATOR/);
    });

    it('should fail with a bad unique id generator', function () {
      _assert2.default.throws(function () {
        new _index2.default({
          secret: 'mysecret',
          uniqueId: 'id'
        });
      }, /E_BAD_ID_GENERATOR/);
    });

    it('should fail with no secret', function () {
      _assert2.default.throws(function () {
        new _index2.default({
          uniqueId: createObjectId,
          time: 'time'
        });
      }, /E_BAD_SECRET/);
      _assert2.default.throws(function () {
        new _index2.default({
          secret: 1664,
          uniqueId: createObjectId,
          time: 'time'
        });
      }, /E_BAD_SECRET/);
    });

    it('should fail with a bad time', function () {
      _assert2.default.throws(function () {
        new _index2.default({
          secret: 'mysecret',
          uniqueId: createObjectId,
          time: 'time'
        });
      }, /E_BAD_TIME/);
    });

    it('should fail with a bad algorithm', function () {
      _assert2.default.throws(function () {
        new _index2.default({
          secret: 'mysecret',
          uniqueId: createObjectId,
          time: time,
          algorithm: 'banana'
        });
      }, /E_BAD_ALGORITHM/);
    });
  });

  describe('createToken()', function () {
    var tokenService = void 0;

    beforeEach(function () {
      tokenService = new _index2.default({
        secret: 'guestwhat',
        time: time,
        uniqueId: createObjectId
      });
    });

    it('should work as expected', function () {
      var id = createObjectId.next();

      (0, _neatequal2.default)(tokenService.createToken({
        method: 'DELETE',
        uri: '/user/abbacacaabbacacaabbacaca/suscriptions/report_received'
      }, time() + 3600000), {
        _id: id,
        hash: '998788d55111d1122e8fa20e1ddb9bead2f638a9816391b62bb4549fecf4ebd6',
        endOfLife: time() + 3600000,
        contents: {
          method: 'DELETE',
          uri: '/user/abbacacaabbacacaabbacaca/suscriptions/report_received'
        }
      });
    });

    describe('should fail', function () {

      it('with no content', function () {
        _assert2.default.throws(function () {
          tokenService.createToken();
        }, /E_NO_CONTENT/);
      });

      it('with no end of life', function () {
        _assert2.default.throws(function () {
          tokenService.createToken({});
        }, /E_NO_END_OF_LIFE/);
      });

      it('with past end of life', function () {
        _assert2.default.throws(function () {
          tokenService.createToken({}, time() - 1);
        }, /E_PAST_END_OF_LIFE/);
      });
    });
  });

  describe('checkToken()', function () {
    var tokenService = void 0;

    beforeEach(function () {
      tokenService = new _index2.default({
        secret: 'guestwhat',
        time: time,
        uniqueId: createObjectId
      });
    });

    it('should work with right token', function () {
      var envelope = {
        _id: createObjectId(),
        endOfLife: time() + 3600000,
        contents: {
          method: 'DELETE',
          uri: '/user/abbacacaabbacacaabbacaca/suscriptions/report_received'
        }
      };
      var hash = tokenService._createHash(envelope);

      _assert2.default.doesNotThrow(function () {
        tokenService.checkToken(envelope, hash);
      });
    });

    describe('should fail', function () {

      it('with no content', function () {
        _assert2.default.throws(function () {
          tokenService.checkToken({
            endOfLife: time(),
            contents: {}
          }, 'hash');
        }, /E_NO_ID/);
      });

      it('with no end of life', function () {
        _assert2.default.throws(function () {
          tokenService.checkToken({
            _id: createObjectId(),
            contents: {}
          }, 'hash');
        }, /E_NO_END_OF_LIFE/);
      });

      it('with no contents', function () {
        _assert2.default.throws(function () {
          tokenService.checkToken({
            _id: createObjectId(),
            endOfLife: time() + 1
          }, 'hash');
        }, /E_NO_CONTENT/);
      });

      it('with no hash', function () {
        _assert2.default.throws(function () {
          tokenService.checkToken({
            _id: createObjectId(),
            contents: {},
            endOfLife: time() + 1
          });
        }, /E_NO_HASH/);
      });

      it('with a bad hash', function () {
        _assert2.default.throws(function () {
          tokenService.checkToken({
            _id: createObjectId(),
            contents: {},
            endOfLife: time() + 1
          }, 'hash');
        }, /E_BAD_HASH/);
      });

      it('with past end of life', function () {
        _assert2.default.throws(function () {
          tokenService.checkToken({
            _id: createObjectId(),
            contents: {},
            endOfLife: time() - 1
          }, '5396c36217178319b5f25da626fda17d104ef57cc6e37124120ec93d6eeabc34');
        }, /E_PAST_END_OF_LIFE/);
      });
    });
  });
});