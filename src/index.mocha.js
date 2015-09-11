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
      }, /E_BAD_time/);
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
          hash: '248b2e12cb4d4adc3ffae6408e962d2ea7c08569bc270fe535fe0f0ad1c31eef',
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
          }, '54aeec457ab8eff27be5a198ef872a14f8b29468931da1516261fcb55b8493ce');
        }, /E_PAST_END_OF_LIFE/);
      });

    });

  });

});
