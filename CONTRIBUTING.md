# Contributing Guide

Thank you for considering contributing to the Inpayment SDK! Here are some guidelines for contributing.

## Development Process

1. Fork this repository
2. Clone your fork to your local machine
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Ensure the code passes tests: `pnpm test`
6. Ensure the code passes linting: `pnpm lint`
7. Commit your changes: `git commit -am 'feat: add some feature'`
8. Push your branch: `git push origin feature/your-feature-name`
9. Create a Pull Request

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/) specification. The commit message format is as follows:

```
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

Common commit types include:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (does not affect code functionality)
- `refactor`: Code refactoring (neither a new feature nor a bug fix)
- `perf`: Performance optimization
- `test`: Adding or modifying tests
- `chore`: Changes to the build process or auxiliary tools

## Development Setup

```bash
# Install dependencies
pnpm install

# Development mode
pnpm dev

# Build
pnpm build

# Test
pnpm test

# Code checking
pnpm lint
```

## Release Process

Only maintainers can release new versions. The release process is as follows:

1. Ensure all code is merged into the main branch
2. Update CHANGELOG.md
3. Run `npm version [patch|minor|major]` to update the version number
4. Push to GitHub: `git push && git push --tags`
5. Run `npm publish` to publish to npm

## Thank You for Your Contribution!
