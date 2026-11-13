describe('jwt.service', () => {
  const SECRET = 'test-only-secret-0123456789abcdef0123456789abcdef';

  test('createToken + verifyToken round trip', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { createToken, verifyToken } = require('./jwt.service');
    const token = createToken({ id: '1', name: 'Admin' });
    const data = verifyToken(token) as { id: string };
    expect(data.id).toBe('1');
  });

  test('verifyToken rejects a token signed with a different secret', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const jwt = require('jsonwebtoken');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { verifyToken } = require('./jwt.service');
    const foreign = jwt.sign({ id: '1' }, 'some-other-secret');
    expect(() => verifyToken(foreign)).toThrow();
  });

  test('verifyToken rejects tokens signed with a pinned-away algorithm (HS384)', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const jwt = require('jsonwebtoken');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { verifyToken } = require('./jwt.service');
    const hs384 = jwt.sign({ id: '1' }, SECRET, { algorithm: 'HS384' });
    expect(() => verifyToken(hs384)).toThrow();
  });

  test('createToken embeds a kid header for future rotation', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { createToken } = require('./jwt.service');
    const token = createToken({ id: '1' });
    const header = JSON.parse(Buffer.from(token.split('.')[0], 'base64url').toString());
    expect(header.kid).toBeTruthy();
    expect(header.alg).toBe('HS256');
  });

  test('loading the module without JWT_SECRET fails fast', () => {
    const previous = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;
    try {
      jest.isolateModules(() => {
        expect(() => {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          require('./jwt.service');
        }).toThrow(/JWT_SECRET/);
      });
    } finally {
      process.env.JWT_SECRET = previous;
    }
  });

  test('verifyToken accepts a token signed with JWT_SECRET_PREVIOUS during rotation', () => {
    const previous = process.env.JWT_SECRET_PREVIOUS;
    process.env.JWT_SECRET_PREVIOUS = 'previous-secret-0123456789abcdef01234567';
    try {
      jest.isolateModules(() => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const jwt = require('jsonwebtoken');
        const legacy = jwt.sign({ id: '1' }, 'previous-secret-0123456789abcdef01234567');
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { verifyToken } = require('./jwt.service');
        const data = verifyToken(legacy) as { id: string };
        expect(data.id).toBe('1');
      });
    } finally {
      if (previous === undefined) {
        delete process.env.JWT_SECRET_PREVIOUS;
      } else {
        process.env.JWT_SECRET_PREVIOUS = previous;
      }
    }
  });
});
