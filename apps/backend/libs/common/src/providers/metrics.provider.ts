import {
  makeCounterProvider,
  makeGaugeProvider,
  makeHistogramProvider,
  makeSummaryProvider,
} from '@willsoto/nestjs-prometheus';

export const MetricsProviders = [
  makeCounterProvider({
    name: 'gateway_requests_total',
    help: 'Total number of requests to API Gateway',
  }),
  makeGaugeProvider({
    name: 'active_users',
    help: 'Number of active users currently online',
  }),
  makeHistogramProvider({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'path'],
    buckets: [0.1, 0.5, 1, 2, 5],
  }),
  makeSummaryProvider({
    name: 'request_size_bytes',
    help: 'Summary of request size in bytes',
  }),
];
