#!/bin/bash

# Script to stage and commit SonarQube CI/CD integration files

echo "Staging SonarQube CI/CD files..."

# Stage the main CI/CD workflow and SonarQube configs
git add .github/workflows/ci-sonar.yml
git add .github/workflows/README.md
git add .github/workflows/PR-CHECKLIST.md
git add backend/sonar-project.properties
git add frontend/sonar-project.properties
git add frontend/package.json
git add frontend/vitest.config.ts
git add SONARQUBE-SETUP.md

# Also stage the other important changes
git add backend/src/controllers/doctor.controller.js
git add backend/src/routes/auth.routes.js
git add backend/src/routes/doctor.routes.js
git add frontend/src/services/doctorService.ts

echo ""
echo "Files staged. Review with: git status"
echo ""
echo "To commit and push:"
echo "  git commit -m 'Add SonarQube CI/CD integration with Quality Gate checks'"
echo "  git push origin test-sonar-integration"
