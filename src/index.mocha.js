/* eslint max-nested-callbacks:[1] */

import assert from 'assert';
import neatequal from 'neatequal';
import iniTimeMock from 'sf-time-mock';
import initObjectIdStub from 'objectid-stub';
import TokenService from './index';

let time = iniTimeMock();
let createObjectId = initObjectIdStub();

describe('TokenService', () => {

  beforeEach(() => {
    createObjectId.reset();
    time.setTime(1267833600000);
  });

  describe('constructor()', () => {

    it('should work with required options only', () => {
      new TokenService({
        secret: 'mysecret',
        uniqueId: createObjectId,
      });
    });

    it('should work with all options', () => {
      new TokenService({
        secret: 'mysecret',
        uniqueId: createObjectId,
        time,
        algorithm: 'md5',
      });
    });

    it('should fail if no unique id generator is given', () => {
      assert.throws(() => {
        new TokenService({
          secret: 'mysecret',
        });
      }, /E_NO_ID_GENERATOR/);
    });

    it('should fail with a bad unique id generator', () => {
      assert.throws(() => {
        new TokenService({
          secret: 'mysecret',
          uniqueId: 'id',
        });
      }, /E_BAD_ID_GENERATOR/);
    });

    it('should fail with no secret', () => {
      assert.throws(() => {
        new TokenService({
          uniqueId: createObjectId,
          time: 'time',
        });
      }, /E_BAD_SECRET/);
      assert.throws(() => {
        new TokenService({
          secret: 1664,
          uniqueId: createObjectId,
          time: 'time',
        });
      }, /E_BAD_SECRET/);
    });

    it('should fail with a bad time', () => {
      assert.throws(() => {
        new TokenService({
          secret: 'mysecret',
          uniqueId: createObjectId,
          time: 'time',
        });
      }, /E_BAD_TIME/);
    });

    it('should fail with a bad algorithm', () => {
      assert.throws(() => {
        new TokenService({
          secret: 'mysecret',
          uniqueId: createObjectId,
          time: time,
          algorithm: 'banana',
        });
      }, /E_BAD_ALGORITHM/);
    });

  });

  describe('createToken()', () => {
    let tokenService;

    beforeEach(() => {
      tokenService = new TokenService({
        secret: 'guestwhat',
        time: time,
        uniqueId: createObjectId,
      });
    });


    it('should work as expected', () => {
      let id = createObjectId.next();

      neatequal(
        tokenService.createToken({
          method: 'DELETE',
          uri: '/user/abbacacaabbacacaabbacaca/suscriptions/report_received',
        }, time() + 3600000),
        {
          _id: id,
          hash: '998788d55111d1122e8fa20e1ddb9bead2f638a9816391b62bb4549fecf4ebd6',
          endOfLife: time() + 3600000,
          contents: {
            method: 'DELETE',
            uri: '/user/abbacacaabbacacaabbacaca/suscriptions/report_received',
          },
        }
      );
    });

    describe('should fail', () => {

      it('with no content', () => {
        assert.throws(() => {
          tokenService.createToken();
        }, /E_NO_CONTENT/);
      });

      it('with no end of life', () => {
        assert.throws(() => {
          tokenService.createToken({});
        }, /E_NO_END_OF_LIFE/);
      });

      it('with past end of life', () => {
        assert.throws(() => {
          tokenService.createToken({}, time() - 1);
        }, /E_PAST_END_OF_LIFE/);
      });

    });

  });

  describe('checkToken()', () => {
    let tokenService;

    beforeEach(() => {
      tokenService = new TokenService({
        secret: 'guestwhat',
        time,
        uniqueId: createObjectId,
      });
    });

    it('should work with right token', () => {
      let envelope = {
        _id: createObjectId(),
        endOfLife: time() + 3600000,
        contents: {
          method: 'DELETE',
          uri: '/user/abbacacaabbacacaabbacaca/suscriptions/report_received',
        },
      };
      let hash = tokenService._createHash(envelope);

      assert.doesNotThrow(() => {
        tokenService.checkToken(envelope, hash);
      });
    });

    describe('should fail', () => {

      it('with no content', () => {
        assert.throws(() => {
          tokenService.checkToken({
            endOfLife: time(),
            contents: {},
          }, 'hash');
        }, /E_NO_ID/);
      });

      it('with no end of life', () => {
        assert.throws(() => {
          tokenService.checkToken({
            _id: createObjectId(),
            contents: {},
          }, 'hash');
        }, /E_NO_END_OF_LIFE/);
      });

      it('with no contents', () => {
        assert.throws(() => {
          tokenService.checkToken({
            _id: createObjectId(),
            endOfLife: time() + 1,
          }, 'hash');
        }, /E_NO_CONTENT/);
      });

      it('with no hash', () => {
        assert.throws(() => {
          tokenService.checkToken({
            _id: createObjectId(),
            contents: {},
            endOfLife: time() + 1,
          });
        }, /E_NO_HASH/);
      });

      it('with a bad hash', () => {
        assert.throws(() => {
          tokenService.checkToken({
            _id: createObjectId(),
            contents: {},
            endOfLife: time() + 1,
          }, 'hash');
        }, /E_BAD_HASH/);
      });

      it('with past end of life', () => {
        assert.throws(() => {
          tokenService.checkToken({
            _id: createObjectId(),
            contents: {},
            endOfLife: time() - 1,
          }, '5396c36217178319b5f25da626fda17d104ef57cc6e37124120ec93d6eeabc34');
        }, /E_PAST_END_OF_LIFE/);
      });

    });

  });

});
