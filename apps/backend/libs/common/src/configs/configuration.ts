export default () => ({
  port: parseInt(process.env.PORT || '3001') || 3001,
  kafka: {
    brokers: process.env.KAFKA_BROKERS || 'localhost:9092',
    username: process.env.KAFKA_USERNAME,
    password: process.env.KAFKA_PASSWORD,
  },
  infisical: {
    project_id: process.env.INFISICAL_PROJECT_ID,
    client_id: process.env.INFISICAL_CLIENT_ID,
    client_secret: process.env.INFISICAL_CLIENT_SECRET,
    site_url: process.env.INFISICAL_SIDE_URL,
  },
  frontend_url: process.env.FRONTEND_URL,
  keycloak: {
    auth_server_url: process.env.KEYCLOAK_AUTH_SERVER_URL,
    client_id: process.env.KEYCLOAK_CLIENT_ID,
    secret: process.env.KEYCLOAK_SECRET,
    realm: process.env.KEYCLOAK_REALM,
    redirect_uri: process.env.KEYCLOAK_REDIRECT_URI,
  },
  default_avatar_url: process.env.DEFAULT_AVATAR_URL,
  default_cover_photo: process.env.DEFAULT_COVER_PHOTO,
  redis_url: process.env.REDIS_URL,
  mailer: {
    host: process.env.MAILER_HOST,
    port: parseInt(process.env.MAILER_PORT ?? '587', 10),
    user: process.env.MAILER_USER,
    pass: process.env.MAILER_PASSWORD,
  },
  jwt: {
    secret_key: process.env.JWT_SECRET_KEY,
    access_token_life: process.env.JWT_ACCESS_TOKEN_LIFE,
  },
  twilio: {
    account_sid: process.env.TWILIO_ACCOUNT_SID,
    auth_token: process.env.TWILIO_AUTH_TOKEN,
    phone_number: process.env.TWILIO_PHONE_NUMBER,
  },
  application_name: process.env.APPLICATION_NAME,
  cloudinary: {
    name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  },
});
