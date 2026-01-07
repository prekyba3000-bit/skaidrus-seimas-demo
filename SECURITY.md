# Security Policy

## Supported Versions

| Version | Supported              |
| ------- | ---------------------- |
| 1.x.x   | ✅ Active support      |
| < 1.0   | ❌ No longer supported |

## Reporting a Vulnerability

**Please do NOT report security vulnerabilities through public GitHub issues.**

### How to Report

1. **Email**: Send details to security@example.com
2. **Include**:
   - Type of issue (injection, authentication bypass, etc.)
   - Full paths of affected source files
   - Location of affected code (tag/branch/commit)
   - Step-by-step instructions to reproduce
   - Proof-of-concept or exploit code (if possible)
   - Impact assessment

### Response Timeline

- **Acknowledgment**: Within 48 hours
- **Status Update**: Within 7 days
- **Resolution**: We aim to patch critical vulnerabilities within 30 days

### Safe Harbor

We consider security research activities conducted consistent with this policy to be:

- Authorized in accordance with any applicable anti-hacking laws
- Not a violation of terms of service
- Exempt from restrictions in our acceptable use policies

## Security Measures

### Application Security

- ✅ Input validation (Zod schemas)
- ✅ Rate limiting on all endpoints
- ✅ PII redaction in logs
- ✅ Environment-based configuration (no hardcoded secrets)
- ✅ Type-safe API (tRPC)

### Infrastructure Security

- ✅ Non-root Docker containers
- ✅ Health checks for all services
- ✅ Encrypted connections (TLS)
- ✅ Automated dependency auditing

### Data Protection

- ✅ PostgreSQL with encrypted connections
- ✅ Redis with authentication
- ✅ Automated database backups
- ✅ GDPR compliance considerations

## Dependency Auditing

We run automated security audits in CI/CD:

```bash
# Check for vulnerabilities
pnpm audit

# Fix automatically (safe fixes only)
pnpm audit fix

# Update to patched versions
pnpm update
```

## Secret Management

- All secrets stored in environment variables
- `.env` files are gitignored
- Production secrets managed via CI/CD secrets
- No API keys or passwords in code

### If Secrets Were Leaked

If you accidentally committed secrets:

```bash
# Install BFG Repo-Cleaner
brew install bfg

# Remove .env files from history
bfg --delete-files .env

# Remove specific patterns
bfg --replace-text patterns.txt

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force
```

## Acknowledgments

We appreciate security researchers who help keep our platform safe. Contributors will be credited in our security hall of fame (with permission).
