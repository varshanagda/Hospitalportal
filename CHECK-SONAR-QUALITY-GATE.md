# How to Check SonarQube Quality Gate Status

## Method 1: Check GitHub Actions (Easiest)

### Step 1: Go to Your Pull Request
1. Open your PR on GitHub
2. Scroll down to the "Checks" section
3. Look for: **"Quality Gate Status Check"**

### Step 2: Click on the Check
1. Click on **"Quality Gate Status Check"** (or "CI with SonarQube Analysis")
2. This will show you the workflow run details

### Step 3: Check the Logs
Look for these messages in the logs:

**✅ If Quality Gate PASSED:**
```
✅ Quality Gate PASSED
PR is ready to merge!
```

**❌ If Quality Gate FAILED:**
```
❌ Quality Gate FAILED
PR cannot be merged. Please fix the issues and try again.
```

**⚠️ If SonarQube Not Configured:**
```
⚠️ SonarQube not configured - skipping Quality Gate check
To enable Quality Gate checks, configure SONAR_TOKEN and SONAR_HOST_URL secrets
✅ Tests passed - PR is ready to merge!
```

## Method 2: Check SonarQube Dashboard (If Configured)

### If you have SonarQube/SonarCloud set up:

1. **Go to SonarQube Dashboard:**
   - SonarCloud: https://sonarcloud.io
   - Self-hosted: Your SonarQube server URL

2. **Find Your Project:**
   - Search for: `hospitalportal-backend` or `hospitalportal-frontend`

3. **Check Quality Gate Status:**
   - Look for the Quality Gate indicator (✅ or ❌)
   - Green = Passed
   - Red = Failed

4. **View Issues:**
   - Click on the project
   - Go to "Issues" tab to see what needs to be fixed

## Method 3: Check GitHub Actions Directly

1. Go to your repository on GitHub
2. Click on **"Actions"** tab
3. Find the latest workflow run for your PR
4. Click on it
5. Look for these jobs:
   - **SonarQube Backend Analysis**
   - **SonarQube Frontend Analysis**
   - **Quality Gate Status Check** ← This is the final check

## Method 4: Check via Command Line

```bash
# Check if SonarQube secrets are configured
gh secret list

# View workflow run status
gh run list --workflow=ci-sonar.yml

# View specific workflow run
gh run view <run-id> --log
```

## Understanding the Status

### ✅ All Checks Passed (3 successful checks)
This means:
- Tests passed
- Quality Gate passed (or was skipped if SonarQube not configured)
- No conflicts

### ❌ Quality Gate Failed
If Quality Gate fails, you'll see:
- Red X on "Quality Gate Status Check"
- Details in the workflow logs
- Link to SonarQube dashboard with issues

## Current Status Based on Your PR

Looking at your PR status:
- ✅ **3 successful checks** - This is good!
- ✅ **No conflicts** - Ready to merge

**To see if SonarQube Quality Gate specifically passed:**

1. Click on **"All checks have passed"** (the green checkmark)
2. Look for **"Quality Gate Status Check"** in the list
3. If you see it with a ✅, Quality Gate passed
4. If you don't see it, SonarQube might be skipped (secrets not configured)

## If SonarQube is Not Configured

If you see this message:
```
⚠️ SonarQube not configured - skipping Quality Gate check
```

This means:
- SonarQube secrets (`SONAR_TOKEN`, `SONAR_HOST_URL`) are not set
- Quality Gate check is skipped
- PR can still be merged (tests passed)
- To enable Quality Gate, configure the secrets (see SONARQUBE-SETUP.md)

## Quick Check Commands

```bash
# Check if secrets exist (requires GitHub CLI)
gh secret list

# View workflow status
gh workflow view ci-sonar.yml
```

## Next Steps

1. **If Quality Gate Passed:** ✅ You're good to merge!
2. **If Quality Gate Failed:** 
   - Check SonarQube dashboard for issues
   - Fix the reported issues
   - Push changes and re-run the workflow
3. **If Not Configured:**
   - Follow SONARQUBE-SETUP.md to set up SonarQube
   - Add secrets to GitHub repository
   - Re-run the workflow
