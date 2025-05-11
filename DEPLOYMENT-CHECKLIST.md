# Miftah Deployment Checklist

## Environment Setup

- [ ] Set `NODE_ENV=production` in your deployment environment
- [ ] Configure `NEXTAUTH_URL` to match your deployed domain
- [ ] Set up `DATABASE_URL` for your production database

## Authentication and Cookies

- [ ] If you use custom domains or subdomains, ensure no explicit domain is set in cookies for better compatibility
- [ ] Verify `NEXT_PUBLIC_APP_URL` is set correctly in your deployment environment
- [ ] Test login functionality after deployment
- [ ] Monitor server logs for authentication-related issues

## TypeScript Setup

- [ ] Run `npx tsc --noEmit` before deployment to catch any type errors
- [ ] Ensure the Next.js route parameter types are properly configured
- [ ] Review any warnings from TypeScript checking

## Database

- [ ] Confirm MongoDB connection is properly configured
- [ ] Run any necessary database migrations
- [ ] Verify indexes are properly set up for optimal performance

## Performance & Optimization

- [ ] Enable caching mechanisms appropriate for your deployment
- [ ] Configure proper CORS settings for API routes
- [ ] Set up proper security headers

## Testing

- [ ] Verify all routes work correctly after deployment
- [ ] Test user authentication flows
- [ ] Check course creation and management features
- [ ] Test student enrollment and progress tracking

## Troubleshooting Common Issues

### Login Loop / Authentication Issues
- If users are experiencing login loops or authentication failures:
  - Check browser developer tools to verify cookies are being properly set
  - Ensure no explicit domain is set for cookies in production (automatic domain is more reliable)
  - Verify that all login-related API routes are returning proper responses
  - Add debug logging to track authentication flow

### API Errors
- If API routes are failing:
  - Check CORS configuration
  - Verify database connection
  - Check server logs for specific errors