# Deployment Checklist for Authentication Fix

This checklist outlines steps to ensure proper authentication in the Vercel environment.

## Before Deployment

1. Verify local environment settings:
   - [ ] Check `.env.production` has correct settings
   - [ ] Ensure `NEXT_PUBLIC_APP_DOMAIN` is set to `vercel.app`
   - [ ] Confirm `NEXTAUTH_URL` matches actual deployment URL

2. Verify cookie handling in the codebase:
   - [x] All authentication endpoints use the same domain handling approach
   - [x] Domain names have the `www` prefix removed for better compatibility
   - [x] Consistent cookie setting with `httpOnly`, `sameSite`, and `secure` flags
   - [x] Login redirects use hard navigation to ensure cookies are applied

## Deployment Steps

1. Push code to Vercel:
   - [ ] Commit all changes with detailed message
   - [ ] Push to the branch connected to your Vercel deployment

2. Configure Vercel Environment Variables:
   - [ ] Set `NEXT_PUBLIC_APP_URL` to `https://miftah-eight.vercel.app`
   - [ ] Set `NEXT_PUBLIC_APP_DOMAIN` to `vercel.app`
   - [ ] Set `NEXTAUTH_URL` to `https://miftah-eight.vercel.app`
   - [ ] Set `NEXTAUTH_SECRET` to your secret value
   - [ ] Set `NODE_ENV` to `production`
   - [ ] Set `DATABASE_URL` to your MongoDB connection string

3. Check build logs:
   - [ ] Ensure the build completes successfully
   - [ ] Look for any warnings about domain configuration
   - [ ] Verify middleware is correctly applied

## Post-Deployment Testing

1. Login Flow:
   - [ ] Test login with valid credentials
   - [ ] Verify redirection to dashboard works properly
   - [ ] Check browser's developer tools to confirm cookies were set correctly
   - [ ] Verify both `userId` and `userRole` cookies are present

2. Session Persistence:
   - [ ] Navigate between protected routes
   - [ ] Close and reopen browser tab to test session persistence
   - [ ] Check if middleware correctly identifies authenticated state

3. Logout Flow:
   - [ ] Test logout functionality
   - [ ] Verify redirection to login page
   - [ ] Confirm cookies are properly cleared
   - [ ] Attempt to access protected route after logout

## Troubleshooting

If authentication issues persist:

1. Access Browser Dev Tools:
   - Check Application > Cookies to view cookie settings
   - Verify cookies have correct domain (should be `.vercel.app` or your domain)
   - Ensure cookies are not marked as SameSite=None without Secure flag

2. Check Server Logs:
   - Review Vercel Function logs for your auth endpoints
   - Look for console messages from middleware and auth routes
   - Check for cookie-related warnings or errors

3. Try Different Browsers:
   - Some browser security settings may affect cookie handling
   - Test in Chrome, Firefox and Safari if possible

4. Clear ALL browser cookies and cache before testing again

## Additional Notes

- The cookie domain setting is particularly important for Vercel deployments
- `vercel.app` as domain value works better than using the full hostname
- Using hard navigation (`window.location.href`) after login/logout ensures cookies are properly applied
- Cookie settings must be consistent across all auth endpoints
