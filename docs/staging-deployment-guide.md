# Staging Deployment Guide (T069)

## Overview
Step-by-step guide for deploying Digital Signage Admin Backoffice to staging environment.

**Environment**: Staging  
**Framework**: Next.js 15  
**Deployment Target**: Vercel / AWS / Docker  
**Last Updated**: October 2, 2025

---

## Prerequisites

- ✅ Production build successful (see T068 Production Build Guide)
- ✅ Staging environment configured
- ✅ Database accessible from staging
- ✅ Environment variables prepared
- ✅ DNS/Domain configured (staging.example.com)

---

## Deployment Methods

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to staging
vercel --prod=false

# Expected: Deployment URL provided
```

### Option 2: Docker

```bash
# Build Docker image
docker build -t digital-signage-web:staging .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://staging-api.example.com \
  digital-signage-web:staging
```

### Option 3: Manual (PM2)

```bash
# Build
npm run build

# Start with PM2
pm2 start npm --name "ds-web-staging" -- start
pm2 save
```

---

## Smoke Tests

### Critical Paths
1. Homepage loads
2. User list displays
3. Schedule assignment works
4. Default schedule toggle works
5. Remove all schedules works

### Verification
```bash
# Health check
curl https://staging.example.com/health

# Expected: 200 OK
```

---

## Rollback Procedure

```bash
# Vercel rollback
vercel rollback [deployment-url]

# Docker rollback
docker stop [container-id]
docker run [previous-image]

# PM2 rollback
pm2 delete ds-web-staging
pm2 start [previous-backup]
```

---

## Monitoring

- **Logs**: Vercel Dashboard / CloudWatch / PM2 logs
- **Errors**: Sentry (if configured)
- **Performance**: Lighthouse CI
- **Uptime**: Pingdom / UptimeRobot

---

**Status**: Ready for Staging ✅
