import configDefault, { ConfigDefault } from './configDefault';

function loadModule() : ConfigDefault {
  if (process.env.NODE_ENV === 'production') {
    const password = process.env.DATABASE_PASSWORD;
    if (!password || password.trim() === '') {
      throw new Error('DATABASE_PASSWORD is required in production. See example.env.');
    }
  }
  return configDefault;
}
const config = loadModule();

export default config;
export * from './env';
export * from './configDefault';