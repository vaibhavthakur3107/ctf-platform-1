# Contributing to Dexter Playz CTF Platform

Thank you for your interest in contributing to Dexter Playz! We welcome contributions from everyone.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

---

## Code of Conduct

### Our Pledge
We pledge to make participation in our community a harassment-free experience for everyone.

### Our Standards
Examples of behavior that contributes to a positive environment:
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community

### Our Responsibilities
Project maintainers are responsible for clarifying the standards of acceptable behavior and taking appropriate action.

---

## How to Contribute

### Reporting Bugs

Before creating bug reports, check the existing issues.

**Bug Report Checklist:**
- [ ] Use a clear and descriptive title
- [ ] Describe the exact steps to reproduce the problem
- [ ] Provide specific examples to demonstrate the steps
- [ ] Describe the behavior you observed
- [ ] Describe the expected behavior
- [ ] Include environment details (OS, Node version, etc.)
- [ ] Include screenshots if applicable

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues.

**Enhancement Suggestion Checklist:**
- [ ] Use a clear and descriptive title
- [ ] Provide a detailed description of the proposed enhancement
- [ ] Explain why this enhancement would be useful
- [ ] List some examples of how this feature would be used
- [ ] If applicable, provide mockups or examples

### Contributing Code

#### Setting Up Development Environment

1. Fork the repository
2. Clone your fork:
```bash
git clone https://github.com/YOUR_USERNAME/dexter-playz-ctf.git
cd dexter-playz-ctf
```

3. Add the upstream repository:
```bash
git remote add upstream https://github.com/ORIGINAL_OWNER/dexter-playz-ctf.git
```

4. Install dependencies:
```bash
npm install
cd server && npm install && cd ..
cd challenge-manager && npm install && cd ..
```

5. Create a feature branch:
```bash
git checkout -b feature/your-feature-name
```

6. Make your changes and test them

7. Commit your changes (see [Commit Guidelines](#commit-guidelines))

8. Push to your fork:
```bash
git push origin feature/your-feature-name
```

9. Create a Pull Request

---

## Development Setup

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Code Quality

```bash
# Run linter
npm run lint

# Fix linting issues automatically
npm run lint -- --fix

# Format code
npm run format
```

### Building

```bash
# Build for production
npm run build

# Test production build
npm start
```

---

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode in tsconfig.json
- Avoid `any` type when possible
- Use interfaces for object shapes
- Use type assertions sparingly

### React/Next.js

- Use functional components with hooks
- Use Server Components when possible
- Keep components small and focused
- Use proper TypeScript types
- Follow naming conventions:
  - Components: PascalCase (e.g., `UserProfile`)
  - Functions: camelCase (e.g., `getUserData`)
  - Constants: UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`)

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Use trailing commas in multi-line objects/arrays
- Add JSDoc comments for functions
- Keep functions under 50 lines when possible

### Security

- Never commit secrets or API keys
- Validate all user inputs
- Use parameterized queries (Prisma)
- Sanitize user-generated content
- Follow security best practices (see SECURITY.md)

### Performance

- Use `useCallback` and `useMemo` for expensive operations
- Lazy load components and images
- Optimize database queries
- Use caching where appropriate
- Avoid unnecessary re-renders

### Accessibility

- Use semantic HTML elements
- Provide alt text for images
- Ensure keyboard navigation works
- Use ARIA attributes when needed
- Test with screen readers

---

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks
- **ci**: CI/CD changes

### Examples

```
feat(challenges): add hint system for challenges

Implement a hint system where users can reveal hints
by spending points. Hints are revealed in order and
each hint has a point cost.

Closes #123
```

```
fix(auth): resolve session timeout issue

Users were being logged out prematurely due to
incorrect session timeout calculation.

Fixes #456
```

```
docs(api): update API documentation for challenges endpoint

Add missing parameters and response examples.
```

---

## Pull Request Process

### Before Submitting

- [ ] Run tests and ensure they pass
- [ ] Run linter and fix any issues
- [ ] Update documentation if needed
- [ ] Add tests for new features
- [ ] Ensure code follows coding standards

### Pull Request Title

Use a clear title that describes the changes:
- `feat: add support for two-factor authentication`
- `fix: resolve leaderboard update latency`
- `docs: update deployment guide`

### Pull Request Description

Include:
- Description of changes
- Why this change is needed
- How it solves the problem
- Any breaking changes
- Screenshots if applicable
- Related issues

### Code Review

- Be respectful and constructive
- Address review comments promptly
- Ask questions if anything is unclear
- Review others' pull requests when possible

### Merging

Pull requests are typically merged when:
- All checks pass
- At least one maintainer approves
- No unresolved discussions
- Documentation is updated (if needed)

---

## Development Workflow

### Feature Development

1. Create an issue for the feature (if not exists)
2. Discuss the approach in the issue
3. Create a feature branch from `main`
4. Implement the feature
5. Write tests
6. Update documentation
7. Submit a pull request

### Bug Fixing

1. Create an issue describing the bug
2. Reproduce the bug locally
3. Create a fix branch from `main`
4. Write a test that reproduces the bug
5. Fix the bug
6. Ensure the test passes
7. Submit a pull request

---

## Areas Where We Need Help

### High Priority
- Writing comprehensive tests
- Improving documentation
- Performance optimization
- Accessibility improvements

### Medium Priority
- UI/UX improvements
- New challenge categories
- Additional security features
- Mobile responsiveness

### Low Priority
- New themes/skins
- Internationalization (i18n)
- Additional integrations
- Performance monitoring dashboards

---

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Eligible for contributor badges
- Invited to maintainers' meetings (for significant contributions)

---

## Questions?

Feel free to:
- Open an issue for questions
- Join our Discord server (if available)
- Email us at contributors@dexterplayz.com

---

Thank you for contributing to Dexter Playz CTF Platform! 🎉
