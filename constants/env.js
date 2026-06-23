export const NODE_ENVS = Object.freeze({
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test',
});

export const isProduction = (nodeEnv) => nodeEnv === NODE_ENVS.PRODUCTION;
