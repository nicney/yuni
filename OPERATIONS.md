# Yuni Operations Guide

## Overview
Yuni is a cross-platform location-based social app built with React Native, Expo, and Firebase. This guide covers deployment, monitoring, and maintenance procedures.

## Environment Setup

### Required Environment Variables
```bash
# Sentry Configuration
EXPO_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
EXPO_PUBLIC_SENTRY_ENVIRONMENT=production

# Cloudflare Pages Configuration
CF_API_TOKEN=your_cloudflare_api_token
CF_ACCOUNT_ID=your_cloudflare_account_id

# Firebase Configuration (existing)
FIREBASE_API_KEY=AIzaSyCjvf37Hq5Hnfe9EZx4yGLwJreWA70RP84
FIREBASE_AUTH_DOMAIN=plat-6c5a7.firebaseapp.com
FIREBASE_PROJECT_ID=plat-6c5a7
FIREBASE_STORAGE_BUCKET=plat-6c5a7.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=1030467310392
FIREBASE_APP_ID=1:1030467310392:web:47906f52c5e10ce8c6a7cd
FIREBASE_MEASUREMENT_ID=G-FR1B9F8YVL
FIREBASE_DATABASE_URL=https://plat-6c5a7-default-rtdb.asia-southeast1.firebaseio.com/
```

### GitHub Secrets
- `CF_API_TOKEN`: Cloudflare API token
- `CF_ACCOUNT_ID`: Cloudflare Account ID
- `LHCI_GITHUB_APP_TOKEN`: Lighthouse CI GitHub App token

## Deployment

### Web Deployment (Cloudflare Pages)
1. **Automatic**: Push to `main` branch triggers deployment
2. **Preview**: Pull requests get preview deployments
3. **Manual**: Use GitHub Actions workflow

### Mobile Deployment (EAS Build)
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Build for production
eas build --platform all --profile production
```

## Monitoring

### Sentry Setup
1. Create Sentry project "Yuni"
2. Enable Errors + Performance + Web Vitals
3. Configure Slack integration (#yuni-alerts)
4. Set up alert rules for SLO violations

### Performance Monitoring
- **LCP**: ≤2.5s at 90% (Error budget: 10%)
- **INP**: ≤200ms at 90% (Error budget: 10%)
- **CLS**: ≤0.1 at 95% (Error budget: 5%)
- **TTFB**: ≤300ms at 95%

### Alert Thresholds
- **Warning**: >50% error budget consumed mid-cycle
- **Critical**: 100% error budget consumed → freeze new features

## Testing

### Local Testing
```bash
# TypeScript check
npm run type-check

# Linting
npm run lint

# Expo Doctor
npx expo doctor

# Web build
npm run build:web

# E2E tests
npm run test:e2e

# Performance check
npm run perf:check
```

### CI/CD Pipeline
1. **Type Check**: TypeScript compilation
2. **Linting**: ESLint validation
3. **Expo Doctor**: Expo configuration check
4. **Web Build**: Expo export for web
5. **Playwright Tests**: E2E testing on 3 viewports
6. **Lighthouse CI**: Performance validation
7. **Deploy**: Cloudflare Pages deployment

## Error Gates

All PRs must pass:
- [ ] `npx tsc --noEmit` (TypeScript)
- [ ] `npm run lint` (ESLint)
- [ ] `npx expo doctor` (Expo)
- [ ] `npx expo export --platform web` (Web build)
- [ ] `npx playwright test` (E2E tests)
- [ ] `lhci autorun` (Lighthouse CI)

## Troubleshooting

### Common Issues

#### 1. Dependency Conflicts
```bash
npm install --legacy-peer-deps
```

#### 2. Sentry Not Working
- Check DSN configuration
- Verify environment variables
- Check network connectivity

#### 3. Map Not Loading
- Verify Leaflet CSS import
- Check OpenStreetMap tile server
- Verify geolocation permissions

#### 4. Performance Issues
- Check Lighthouse CI results
- Monitor Sentry performance metrics
- Review error budget consumption

### Rollback Procedures

#### Web Rollback
1. Revert to previous commit
2. Push to main branch
3. Cloudflare Pages auto-deploys

#### Mobile Rollback
1. Use EAS Build rollback
2. Or revert to previous build

## Maintenance

### Weekly Tasks
- [ ] Review Sentry error reports
- [ ] Check performance metrics
- [ ] Monitor error budget consumption
- [ ] Review CI/CD pipeline health

### Monthly Tasks
- [ ] Update dependencies
- [ ] Review and update SLO targets
- [ ] Performance optimization review
- [ ] Security audit

## Support

### Slack Channels
- `#yuni-alerts`: Sentry alerts and critical issues
- `#yuni-dev`: Development discussions

### Documentation
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Sentry Documentation](https://docs.sentry.io/)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
