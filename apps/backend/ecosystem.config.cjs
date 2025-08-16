const dotenv = require('dotenv');
dotenv.config();

const commonSettings = {
  ignore_watch: ['node_modules'],
  env: { NODE_ENV: 'development' },
  env_production: { NODE_ENV: 'production' },
};

const rawServices = process.env.SERVICE_NAMES || '';

const serviceNames = rawServices
  .split(',')
  .map((name) => name.trim())
  .filter(Boolean);

const createApp = (name, script, extraEnv = {}) => ({
  name,
  script,
  ...commonSettings,
  env: { ...commonSettings.env, ...extraEnv },
});

const apps = [
  createApp(
    'api-gateway',
    'dist/apps/api-gateway/apps/backend/apps/api-gateway/src/main.js',
    { PORT: 3001 },
  ),
  ...serviceNames.map((service) =>
    createApp(
      `${service}-service`,
      `dist/apps/${service}/apps/backend/apps/${service}/src/main.js`,
    ),
  ),
];

module.exports = { apps };
