describe('config', () => {
  test('throws at load time in production when DATABASE_PASSWORD is missing', () => {
    const prevNodeEnv = process.env.NODE_ENV;
    const prevPassword = process.env.DATABASE_PASSWORD;
    process.env.NODE_ENV = 'production';
    delete process.env.DATABASE_PASSWORD;
    try {
      jest.isolateModules(() => {
        expect(() => {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          require('./index');
        }).toThrow(/DATABASE_PASSWORD/);
      });
    } finally {
      process.env.NODE_ENV = prevNodeEnv;
      if (prevPassword !== undefined) {
        process.env.DATABASE_PASSWORD = prevPassword;
      }
    }
  });

  test('does not fall back to a guessable default password outside production', () => {
    const prevNodeEnv = process.env.NODE_ENV;
    const prevPassword = process.env.DATABASE_PASSWORD;
    process.env.NODE_ENV = 'development';
    delete process.env.DATABASE_PASSWORD;
    try {
      jest.isolateModules(() => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const config = require('./index').default;
        expect(config.sequelize.password).toBe('');
        expect(config.sequelize.password).not.toBe('1234');
      });
    } finally {
      process.env.NODE_ENV = prevNodeEnv;
      if (prevPassword !== undefined) {
        process.env.DATABASE_PASSWORD = prevPassword;
      }
    }
  });
});
