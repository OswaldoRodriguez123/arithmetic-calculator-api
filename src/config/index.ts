import configDefault, { ConfigDefault } from './configDefault';

function loadModule() : ConfigDefault {
  return configDefault;
}
const config = loadModule();

export default config;
export * from './env';
export * from './configDefault';