export default () => ({
  port: parseInt(process.env.PORT || '3001') || 3001,
  kafka: {
    brokers: process.env.KAFKA_BROKERS || 'localhost:9092',
    username: process.env.KAFKA_USERNAME,
    password: process.env.KAFKA_PASSWORD,
  },
});
