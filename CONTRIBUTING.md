# Contributing to Skaidrus Seimas

First off, thank you for considering contributing to Skaidrus Seimas! 🎉

This project exists to promote transparency in Lithuanian democracy, and every contribution helps make parliamentary data more accessible to citizens.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Branching Strategy](#branching-strategy)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

---

## 📜 Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code. Please be respectful, inclusive, and constructive in all interactions.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 22+
- pnpm (or npm)
- PostgreSQL 16+
- Redis 7+
- Docker (recommended)

### Setting Up Your Development Environment

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/skaidrus-seimas-demo.git
cd skaidrus-seimas-demo

# 3. Add upstream remote
git remote add upstream https://github.com/original-org/skaidrus-seimas-demo.git

# 4. Install dependencies
pnpm install

# 5. Set up environment
cp .env.example .env
# Edit .env with your local database credentials

# 6. Start development services (PostgreSQL, Redis)
docker-compose up postgres redis -d

# 7. Run database migrations
npm run db:push

# 8. Seed initial data
npm run sync:mps

# 9. Start the development server
npm run dev
```

---

## 🔄 Development Workflow

### Daily Workflow

1. **Sync with upstream** before starting work:

   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create a feature branch** (see Branching Strategy below)

3. **Make your changes** with atomic commits

4. **Run tests** to ensure nothing is broken:

   ```bash
   npm run check    # TypeScript validation
   npm run test     # Unit/integration tests
   ```

5. **Push your branch** and create a Pull Request

---

## 🌳 Branching Strategy

We follow a simplified Git Flow model:

```
main (production-ready)
  │
  ├── develop (integration branch)
  │     │
  │     ├── feature/add-mp-timeline
  │     ├── feature/improve-search
  │     └── fix/voting-data-sync
  │
  ├── hotfix/critical-security-patch
  │
  └── release/v1.1.0
```

### Branch Naming Convention

| Type    | Pattern                     | Example                         |
| ------- | --------------------------- | ------------------------------- |
| Feature | `feature/short-description` | `feature/add-mp-comparison`     |
| Bug Fix | `fix/short-description`     | `fix/voting-data-sync`          |
| Hotfix  | `hotfix/short-description`  | `hotfix/security-vulnerability` |
| Release | `release/vX.Y.Z`            | `release/v1.1.0`                |
| Docs    | `docs/short-description`    | `docs/update-api-reference`     |

### Rules

1. **Never commit directly to `main`** - always use Pull Requests
2. **Keep branches short-lived** - aim to merge within 1-2 days
3. **Rebase on `main`** before merging to keep history clean
4. **Delete branches** after merging

---

## 💬 Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types

| Type       | Description                                             |
| ---------- | ------------------------------------------------------- |
| `feat`     | New feature                                             |
| `fix`      | Bug fix                                                 |
| `docs`     | Documentation only                                      |
| `style`    | Formatting, missing semicolons, etc.                    |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf`     | Performance improvement                                 |
| `test`     | Adding missing tests                                    |
| `chore`    | Maintenance tasks, dependencies                         |

### Examples

```bash
# Feature
feat(comparison): add voting agreement calculator

# Bug fix
fix(sync): handle null vote times from legacy data

# Documentation
docs: update API endpoint reference

# With body and footer
feat(caching): implement stale-while-revalidate pattern

Adds Redis caching with background refresh for expensive queries.
Reduces average response time for MP voting history from 800ms to 50ms.

Closes #123
```

---

## 🔍 Pull Request Process

### Before Submitting

- [ ] Run `npm run check` (no TypeScript errors)
- [ ] Run `npm run test` (all tests passing)
- [ ] Run `npm run format` (code formatted)
- [ ] Update documentation if needed
- [ ] Add tests for new functionality

### PR Template

When creating a PR, include:

```markdown
## Description

Brief description of the changes.

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

How did you test this change?

## Screenshots (if applicable)

Add screenshots for UI changes.

## Checklist

- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where needed
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix/feature works
- [ ] All tests pass locally
```

### Review Process

1. **Automated Checks**: CI must pass (tests, type checking, build)
2. **Code Review**: At least 1 approval required
3. **Merge**: Squash and merge to keep history clean

---

## 📝 Coding Standards

### TypeScript

- Use strict mode (`strict: true` in tsconfig)
- Prefer `const` over `let`
- Use explicit return types for functions
- Use Zod for runtime validation

### React

- Use functional components with hooks
- Keep components small and focused
- Use Tailwind CSS for styling
- Follow the component structure in `client/src/components`

### Database

- Use Drizzle ORM for all database operations
- Define schemas in `drizzle/schema.ts`
- Use parameterized queries (never raw SQL with string interpolation)

### API

- Use tRPC procedures for all endpoints
- Validate input with Zod schemas
- Use proper error handling with custom error types

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test -- --watch

# Run specific test file
npm run test -- scripts/__tests__/scrape-votes-api.test.ts

# Run with coverage
npm run test -- --coverage
```

### Test Structure

- Unit tests: `**/__tests__/*.test.ts`
- Integration tests: `scripts/__tests__/*.test.ts`
- Schema validation tests: `server/__tests__/schemas/*.test.ts`

### Writing Tests

- Use Vitest for testing
- Mock external APIs (Seimas, etc.)
- Use Zod for parameter validation testing
- Aim for 90%+ coverage on critical paths

---

## 📚 Documentation

### Where to Document

| Type            | Location                      |
| --------------- | ----------------------------- |
| API endpoints   | Code comments + README        |
| Database schema | `drizzle/schema.ts` comments  |
| Scripts         | Header comment in each script |
| Architecture    | `docs/` folder + README       |
| User guides     | `docs/` folder                |

### Style

- Use clear, concise language
- Include code examples where helpful
- Keep documentation up-to-date with code changes
- Use Mermaid.js for diagrams

---

## 🎯 Good First Issues

New contributors should look for issues labeled:

- `good first issue` - Simple, well-scoped tasks
- `help wanted` - Open for community contribution
- `documentation` - Improvements to docs

---

## 💡 Feature Requests

Have an idea? Open a GitHub issue with:

1. **Problem**: What problem does this solve?
2. **Solution**: How should it work?
3. **Alternatives**: What else did you consider?
4. **Context**: Who would benefit?

---

## 🐛 Bug Reports

Found a bug? Open a GitHub issue with:

1. **Description**: What happened?
2. **Expected**: What should have happened?
3. **Steps**: How to reproduce?
4. **Environment**: OS, Node version, browser, etc.
5. **Logs**: Any error messages?

---

## 📞 Getting Help

- **Questions**: Open a GitHub Discussion
- **Bugs**: Open a GitHub Issue
- **Security**: Email security@example.com (do NOT open public issues)

---

Thank you for contributing to transparent democracy! 🇱🇹
