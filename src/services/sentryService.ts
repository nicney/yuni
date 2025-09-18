import * as Sentry from '@sentry/react';
import { getErrorMessage } from '../../services/errorService';

// Initialize Sentry for web
export const initSentryWeb = () => {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN_WEB;
  
  if (!dsn || dsn === 'YOUR_SENTRY_DSN_HERE') {
    console.warn('Sentry Web DSN not configured, skipping Sentry initialization');
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.EXPO_PUBLIC_SENTRY_ENVIRONMENT || 'development',
    tracesSampleRate: 1.0,
    integrations: [
      // BrowserTracing will be added automatically in newer versions
    ],
    beforeSend(event) {
      // Filter out development errors
      if (process.env.NODE_ENV === 'development') {
        console.log('Sentry event (dev mode):', event);
        return null;
      }
      return event;
    },
  });

  console.log('Sentry initialized for web');
};

// Initialize Sentry for mobile
export const initSentryMobile = () => {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN_MOBILE;
  
  if (!dsn || dsn === 'YOUR_SENTRY_DSN_HERE') {
    console.warn('Sentry Mobile DSN not configured, skipping Sentry initialization');
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.EXPO_PUBLIC_SENTRY_ENVIRONMENT || 'development',
    tracesSampleRate: 1.0,
    beforeSend(event) {
      // Filter out development errors
      if (process.env.NODE_ENV === 'development') {
        console.log('Sentry event (dev mode):', event);
        return null;
      }
      return event;
    },
  });

  console.log('Sentry initialized for mobile');
};

// Log performance metrics
export const logPerformanceMetric = (metric: string, value: number) => {
  Sentry.addBreadcrumb({
    category: 'performance',
    message: `${metric}: ${value}ms`,
    level: 'info',
  });
};

// Log SLO events
export const logSLOEvent = (slo: string, status: 'pass' | 'fail', value: number) => {
  Sentry.addBreadcrumb({
    category: 'slo',
    message: `${slo}: ${status} (${value})`,
    level: status === 'pass' ? 'info' : 'warning',
  });
};

// Log custom events
export const logEvent = (event: string, data?: any) => {
  Sentry.addBreadcrumb({
    category: 'custom',
    message: event,
    data,
    level: 'info',
  });
};

// Capture errors
export const captureError = (error: any, context?: any) => {
  console.error('Capturing error:', error);
  Sentry.captureException(error, {
    extra: context,
  });
};

// Capture messages
export const captureMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
  console.log(`Sentry message (${level}):`, message);
  Sentry.captureMessage(message, level);
};
