# SonarQube Issues - Fix Summary

## Completed Fixes

### Shell Scripts ✅
- START-BACKEND-NOW.sh - Fixed `[[` conditionals
- fix-500-error.sh - Fixed `[[` and stderr redirects  
- fix-registration.sh - Fixed `[[` and stderr redirects
- test-and-fix-password.sh - Fixed `[[` and stderr redirects

### Remaining Shell Script Fixes Needed

Run this command to fix remaining shell scripts:

```bash
# Fix check-database.sh (L31)
sed -i '' 's/if \[ /if [[ /g; s/ \];/ ]];/g' check-database.sh

# Fix fix-password-error.sh (L5)
sed -i '' '5s/echo "/echo " >\&2/' fix-password-error.sh

# Fix fix-password-now.sh (L5, L14, L44, L66)
sed -i '' 's/if \[ /if [[ /g; s/ \];/ ]];/g; 5s/echo.*"/& >\&2/; 66s/echo "The password"/echo "The password" >\&2/' fix-password-now.sh

# Fix start-backend-simple.sh (L4, L14, L30)
sed -i '' 's/if \[ /if [[ /g; s/ \];/ ]];/g; 4s/echo "THE/echo "THE" >\&2/' start-backend-simple.sh

# Fix start-backend.sh (L11)
sed -i '' 's/if \[ /if [[ /g; s/ \];/ ]];/g' start-backend.sh

# Fix test-backend-connection.sh (L38, L44)
sed -i '' 's/if \[ /if [[ /g; s/ \];/ ]];/g' test-backend-connection.sh
```

### Frontend/Backend Code Issues

#### Optional Chain Expressions
Files to fix:
- backend/src/middleware/auth.middleware.js (L27)
- backend/src/middleware/role.middleware.js (L29, L51)
- backend/src/routes/auth.routes.js (L121, L172)
- frontend/src/pages/UserDashboard.tsx (L94, L127)
- frontend/src/pages/login.tsx (L28)
- frontend/src/services/authService.ts (L39)

Example fix:
```javascript
// Before
if (user && user.role)

// After
if (user?.role)
```

#### Duplicate Functions  
Files to fix - consolidate similar handlers:
- frontend/src/components/shared/ConditionalHoverButton.tsx
- frontend/src/components/shared/HoverButton.tsx
- frontend/src/components/shared/LogoutButton.tsx
- frontend/src/components/shared/FormHandlers.ts
- frontend/src/pages/AdminDashboard.tsx
- frontend/src/pages/UserDashboard.tsx

#### React Accessibility
- Popup.tsx: Fix role attributes, use semantic HTML
- UserDashboard.tsx: Replace div role="button" with actual button elements

