// Test environment defaults. Individual tests may override process.env before
// requiring modules (via jest.isolateModules) for specific scenarios.
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-only-secret-0123456789abcdef0123456789abcdef';
process.env.LOGIN_RATE_LIMIT_MAX = process.env.LOGIN_RATE_LIMIT_MAX || '10000';
process.env.LOGIN_USERNAME_RATE_LIMIT_MAX = process.env.LOGIN_USERNAME_RATE_LIMIT_MAX || '10000';
