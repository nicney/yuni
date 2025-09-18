import { onCLS, onFCP, onLCP, onTTFB } from 'web-vitals';
import { logPerformanceMetric, logSLOEvent } from './sentryService';

// SLO targets
const SLO_TARGETS = {
  lcp: { p75: 2500, threshold: 90 }, // 2.5s at 90%
  inp: { p75: 200, threshold: 90 },  // 200ms at 90%
  cls: { p75: 0.1, threshold: 95 },  // 0.1 at 95%
  ttfb: { p95: 300, threshold: 95 }, // 300ms at 95%
};

// Performance budget tracking
const performanceData: Record<string, number[]> = {
  lcp: [],
  inp: [],
  cls: [],
  ttfb: [],
};

// Initialize Web Vitals monitoring
export const initWebVitals = () => {
  if (typeof window === 'undefined') return;

  // LCP (Largest Contentful Paint)
  onLCP((metric) => {
    performanceData.lcp.push(metric.value);
    logPerformanceMetric('LCP', metric.value);
    
    // Check SLO
    const target = SLO_TARGETS.lcp;
    const status = metric.value <= target.p75 ? 'pass' : 'fail';
    logSLOEvent('LCP', status, metric.value);
  });

  // INP (Interaction to Next Paint) - skip for now as onFID is not available
  // TODO: Implement INP monitoring when available

  // CLS (Cumulative Layout Shift)
  onCLS((metric) => {
    performanceData.cls.push(metric.value);
    logPerformanceMetric('CLS', metric.value);
    
    // Check SLO
    const target = SLO_TARGETS.cls;
    const status = metric.value <= target.p75 ? 'pass' : 'fail';
    logSLOEvent('CLS', status, metric.value);
  });

  // TTFB (Time to First Byte)
  onTTFB((metric) => {
    performanceData.ttfb.push(metric.value);
    logPerformanceMetric('TTFB', metric.value);
    
    // Check SLO
    const target = SLO_TARGETS.ttfb;
    const status = metric.value <= target.p95 ? 'pass' : 'fail';
    logSLOEvent('TTFB', status, metric.value);
  });

  // FCP (First Contentful Paint) - additional metric
  onFCP((metric) => {
    logPerformanceMetric('FCP', metric.value);
  });

  console.log('Web Vitals monitoring initialized');
};

// Get performance summary
export const getPerformanceSummary = () => {
  const summary: Record<string, any> = {};
  
  Object.keys(performanceData).forEach(metric => {
    const values = performanceData[metric];
    if (values.length > 0) {
      summary[metric] = {
        count: values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        p75: getPercentile(values, 75),
        p95: getPercentile(values, 95),
      };
    }
  });
  
  return summary;
};

// Calculate percentile
const getPercentile = (values: number[], percentile: number): number => {
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[index] || 0;
};

// Check if performance budget is exceeded
export const checkPerformanceBudget = () => {
  const summary = getPerformanceSummary();
  const alerts: string[] = [];
  
  Object.keys(SLO_TARGETS).forEach(metric => {
    const target = SLO_TARGETS[metric as keyof typeof SLO_TARGETS];
    const data = summary[metric];
    
    if (data && data.p75 > (target as any).p75) {
      alerts.push(`${metric.toUpperCase()} exceeds SLO: ${data.p75} > ${(target as any).p75}`);
    }
  });
  
  return alerts;
};
