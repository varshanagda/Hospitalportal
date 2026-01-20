# CI/CD Pipeline with SonarQube

This repository uses GitHub Actions for CI/CD with SonarQube quality gate checks.

## Workflow Overview

The CI pipeline runs on every Pull Request and push to main/develop branches:

1. **Backend Tests** - Runs Jest tests with coverage
2. **Frontend Tests** - Runs frontend tests with coverage  
3. **SonarQube Analysis** - Scans code for quality issues
4. **Quality Gate Check** - Validates code quality standards
5. **PR Blocking** - Prevents merge if Quality Gate fails

## Setup Instructions

### 1. SonarQube Server Setup

You need a SonarQube server instance. Options:
- **SonarCloud** (Free for open source): https://sonarcloud.io
- **Self-hosted SonarQube**: Install on your own server

### 2. Configure GitHub Secrets

Go to your repository → Settings → Secrets and variables → Actions

Add these secrets:

- `SONAR_TOKEN`: Your SonarQube authentication token
  - SonarCloud: Generate from https://sonarcloud.io/account/security
  - Self-hosted: Generate from SonarQube → My Account → Security

- `SONAR_HOST_URL`: Your SonarQube server URL
  - SonarCloud: `https://sonarcloud.io`
  - Self-hosted: `http://your-sonarqube-server:9000`

### 3. Create SonarQube Projects

#### For SonarCloud:
1. Go to https://sonarcloud.io
2. Create organization (if needed)
3. Create project: `hospitalportal-backend`
4. Create project: `hospitalportal-frontend`
5. Get project keys

#### For Self-hosted:
1. Login to SonarQube
2. Create project: `hospitalportal-backend`
3. Create project: `hospitalportal-frontend`

### 4. Update Workflow File (if needed)

If using SonarCloud, you may need to add organization key:

```yaml
-Dsonar.organization=your-org-key
```

### 5. Configure Quality Gates

In SonarQube:
1. Go to Quality Gates
2. Create or use default Quality Gate
3. Set thresholds:
   - Coverage: Minimum 70%
   - Duplicated Lines: Maximum 3%
   - Maintainability Rating: A
   - Reliability Rating: A
   - Security Rating: A

## How It Works

### On Pull Request:

1. **Tests Run** - All tests execute with coverage collection
2. **Coverage Reports** - Generated and uploaded as artifacts
3. **SonarQube Scan** - Code is analyzed for:
   - Code smells
   - Bugs
   - Security vulnerabilities
   - Code coverage
   - Duplications
4. **Quality Gate** - SonarQube evaluates against quality standards
5. **PR Status** - If Quality Gate fails, PR shows ❌ and cannot be merged

### Quality Gate Failure:

When Quality Gate fails:
- ❌ PR shows failed status
- Merge button is disabled (if branch protection is enabled)
- Comments are posted on PR with details
- Developer must fix issues and push again

## Branch Protection Setup

To enforce Quality Gate blocking:

1. Go to repository → Settings → Branches
2. Add branch protection rule for `main` and `develop`
3. Enable: "Require status checks to pass before merging"
4. Select: `Quality Gate Status Check`
5. Save

## Manual Testing

Test the workflow locally:

```bash
# Backend
cd backend
npm run test:coverage
npm run sonar

# Frontend  
cd frontend
npm run test:coverage
# Add sonar script if needed
```

## Troubleshooting

### Quality Gate Always Fails

1. Check SonarQube dashboard for specific issues
2. Review Quality Gate thresholds
3. Ensure coverage meets minimum requirements
4. Fix code smells and bugs

### SonarQube Connection Issues

1. Verify `SONAR_TOKEN` is correct
2. Check `SONAR_HOST_URL` is accessible
3. Ensure token has proper permissions
4. Check SonarQube server is running

### Coverage Not Found

1. Verify tests generate `coverage/lcov.info`
2. Check `sonar.javascript.lcov.reportPaths` in properties
3. Ensure coverage directory is uploaded as artifact

## Customization

### Adjust Coverage Thresholds

Edit `backend/jest.config.ts` and `frontend/vitest.config.ts`:

```typescript
coverageThreshold: {
  global: {
    branches: 80,    // Increase from 50
    functions: 80,  // Increase from 50
    lines: 80,      // Increase from 70
    statements: 80  // Increase from 70
  }
}
```

### Add More Quality Checks

Edit `.github/workflows/ci-sonar.yml` to add:
- Linting checks
- Security scanning
- Dependency vulnerability checks

## Resources

- [SonarQube Documentation](https://docs.sonarqube.org/)
- [SonarCloud Documentation](https://docs.sonarcloud.io/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
