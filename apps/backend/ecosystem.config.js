const commonSettings = {
  ignore_watch: ['node_modules'],
  env: { NODE_ENV: 'development' },
  env_production: { NODE_ENV: 'production' },
};

const serviceNames = [
  'auth',
  'users',
  'posts',
  'conversations',
  'stories',
  'emails',
  'redis',
];

const createApp = (name, script, watch, extraEnv = {}) => ({
  name,
  script,
  watch,
  ...commonSettings,
  env: { ...commonSettings.env, ...extraEnv },
});

const apps = [
  createApp(
    'api-gateway',
    'dist/apps/api-gateway/apps/backend/apps/api-gateway/src/main.js',
    ['apps/api-gateway/src'],
    { PORT: 3001 },
  ),
  ...serviceNames.map((service) =>
    createApp(
      `${service}-service`,
      `dist/apps/${service}/apps/backend/apps/${service}/src/main.js`,
      [`apps/${service}/src`],
    ),
  ),
];

module.exports = { apps };
