# PR Quality Checklist

Before creating a PR, ensure:

- [ ] All tests pass locally
- [ ] Code coverage meets minimum thresholds (70%+)
- [ ] No linting errors
- [ ] SonarQube Quality Gate passes
- [ ] Code follows project conventions
- [ ] Documentation updated (if needed)

## Running Checks Locally

```bash
# Backend
cd backend
npm run test:coverage
npm run lint

# Frontend
cd frontend
npm run test:coverage
npm run lint
```

## Quality Gate Requirements

- ✅ Coverage: Minimum 70%
- ✅ No new bugs
- ✅ No new security vulnerabilities
- ✅ Code smells within limits
- ✅ Duplicated code < 3%
