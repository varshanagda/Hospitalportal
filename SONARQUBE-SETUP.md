# 🔍 SonarQube CI/CD Integration Guide

## Overview

This project integrates SonarQube into the CI pipeline to ensure code quality. On every PR:
- ✅ Tests run with coverage
- ✅ SonarQube scans the code
- ✅ Quality Gate is checked
- ❌ PR is blocked if Quality Gate fails

---

## 🚀 Quick Setup (5 Steps)

### Step 1: Choose SonarQube Platform

**Option A: SonarCloud (Recommended - Free for open source)**
- Sign up at https://sonarcloud.io
- Free for public repositories

**Option B: Self-hosted SonarQube**
- Install SonarQube server
- Access at `http://your-server:9000`

### Step 2: Create SonarQube Projects

1. Login to SonarQube/SonarCloud
2. Create project: `hospitalportal-backend`
3. Create project: `hospitalportal-frontend`
4. Note the project keys

### Step 3: Generate Authentication Token

**SonarCloud:**
1. Go to: https://sonarcloud.io/account/security
2. Generate new token
3. Copy the token

**Self-hosted:**
1. Login to SonarQube
2. Go to: My Account → Security
3. Generate new token
4. Copy the token

### Step 4: Configure GitHub Secrets

1. Go to your GitHub repository
2. Navigate to: **Settings → Secrets and variables → Actions**
3. Click **New repository secret**
4. Add these secrets:

   **Secret 1:**
   - Name: `SONAR_TOKEN`
   - Value: `[Your SonarQube token from Step 3]`

   **Secret 2:**
   - Name: `SONAR_HOST_URL`
   - Value: 
     - SonarCloud: `https://sonarcloud.io`
     - Self-hosted: `http://your-sonarqube-server:9000`

### Step 5: Enable Branch Protection (Optional but Recommended)

1. Go to: **Settings → Branches**
2. Click **Add rule**
3. Branch name pattern: `main` (and `develop`)
4. Enable:
   - ✅ **Require status checks to pass before merging**
   - ✅ **Require branches to be up to date before merging**
5. Under "Status checks", select:
   - ✅ `Quality Gate Status Check`
   - ✅ `Backend Tests & Coverage`
   - ✅ `Frontend Tests & Coverage`
6. Click **Save**

---

## ✅ Verify Setup

### Test the Pipeline

1. Create a test branch:
   ```bash
   git checkout -b test-ci-pipeline
   ```

2. Make a small change and commit:
   ```bash
   git add .
   git commit -m "Test CI pipeline"
   git push origin test-ci-pipeline
   ```

3. Create a Pull Request

4. Check GitHub Actions:
   - Go to **Actions** tab
   - You should see the workflow running
   - Wait for completion

5. Check SonarQube:
   - Go to your SonarQube dashboard
   - You should see analysis results

---

## 📊 Understanding Quality Gate

### What is Quality Gate?

Quality Gate is a set of conditions that code must meet:
- ✅ Code coverage above threshold
- ✅ No new bugs
- ✅ No new security vulnerabilities
- ✅ Code smells within limits
- ✅ Duplicated code below threshold

### Quality Gate Status

- **✅ PASSED**: Code meets quality standards → PR can be merged
- **❌ FAILED**: Code doesn't meet standards → PR is blocked

### When Quality Gate Fails

1. **PR shows failed status** ❌
2. **Merge button is disabled** (if branch protection enabled)
3. **Check SonarQube dashboard** for specific issues
4. **Fix the issues** and push again
5. **Pipeline re-runs** automatically

---

## 🔧 Configuration Files

### Backend SonarQube Config
`backend/sonar-project.properties`

### Frontend SonarQube Config
`frontend/sonar-project.properties`

### CI Workflow
`.github/workflows/ci-sonar.yml`

---

## 🎯 Quality Gate Thresholds

Default thresholds (can be customized in SonarQube):

- **Coverage**: Minimum 70%
- **Duplicated Lines**: Maximum 3%
- **Maintainability Rating**: A
- **Reliability Rating**: A
- **Security Rating**: A

### Customize Thresholds

1. Login to SonarQube
2. Go to: **Quality Gates**
3. Edit your Quality Gate
4. Adjust thresholds
5. Save

---

## 🐛 Troubleshooting

### Issue: "Quality Gate failed but I don't know why"

**Solution:**
1. Click on the failed check in PR
2. View details → SonarQube dashboard link
3. Review issues in SonarQube
4. Fix reported issues

### Issue: "SonarQube connection failed"

**Check:**
1. `SONAR_TOKEN` secret is correct
2. `SONAR_HOST_URL` is accessible
3. Token has proper permissions
4. SonarQube server is running (if self-hosted)

### Issue: "Coverage not found"

**Check:**
1. Tests are generating coverage reports
2. Coverage files exist: `coverage/lcov.info`
3. SonarQube properties point to correct path

### Issue: "PR not blocked even when Quality Gate fails"

**Solution:**
1. Enable branch protection (Step 5 above)
2. Ensure "Require status checks" is enabled
3. Select "Quality Gate Status Check" in required checks

---

## 📝 Workflow Details

### Jobs in Pipeline

1. **test-backend**
   - Sets up PostgreSQL
   - Installs dependencies
   - Runs tests with coverage
   - Uploads coverage reports

2. **test-frontend**
   - Installs dependencies
   - Runs tests with coverage
   - Uploads coverage reports

3. **sonar-backend**
   - Downloads coverage
   - Runs SonarQube scan
   - Checks Quality Gate
   - Fails if Quality Gate doesn't pass

4. **sonar-frontend**
   - Downloads coverage
   - Runs SonarQube scan
   - Checks Quality Gate

5. **quality-gate-check**
   - Final check of all Quality Gates
   - Blocks PR if any failed

---

## 🎓 Best Practices

1. **Fix issues early** - Don't wait until PR
2. **Run tests locally** before pushing
3. **Check SonarQube dashboard** regularly
4. **Review Quality Gate** before creating PR
5. **Keep coverage high** - Aim for 80%+

---

## 📚 Additional Resources

- [SonarQube Documentation](https://docs.sonarqube.org/)
- [SonarCloud Documentation](https://docs.sonarcloud.io/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Quality Gates Guide](https://docs.sonarqube.org/latest/user-guide/quality-gates/)

---

## ✅ Setup Checklist

- [ ] SonarQube/SonarCloud account created
- [ ] Projects created (backend & frontend)
- [ ] Authentication token generated
- [ ] GitHub secrets configured (SONAR_TOKEN, SONAR_HOST_URL)
- [ ] Branch protection enabled (optional)
- [ ] Test PR created and pipeline runs successfully
- [ ] Quality Gate is working
- [ ] Team is aware of Quality Gate requirements

---

**Once setup is complete, every PR will automatically check code quality!** 🎉
