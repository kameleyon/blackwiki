# Contributing to BlackWiki

First off, thank you for considering contributing to BlackWiki! It's people like you that make BlackWiki such a great tool for preserving and sharing Black culture and history.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* Use a clear and descriptive title
* Describe the exact steps which reproduce the problem
* Provide specific examples to demonstrate the steps
* Describe the behavior you observed after following the steps
* Explain which behavior you expected to see instead and why
* Include screenshots if possible

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* Use a clear and descriptive title
* Provide a step-by-step description of the suggested enhancement
* Provide specific examples to demonstrate the steps
* Describe the current behavior and explain which behavior you expected to see instead
* Explain why this enhancement would be useful to most BlackWiki users

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

## Development Process

1. Clone the repository
   ```bash
   git clone https://github.com/kameleyon/blackwiki.git
   ```

2. Create a branch
   ```bash
   git checkout -b feature/my-feature
   # or
   git checkout -b fix/my-fix
   ```

3. Set up development environment
   ```bash
   npm install
   cp .env.example .env
   # Configure your environment variables
   ```

4. Make your changes
   - Write meaningful commit messages
   - Add tests if applicable
   - Update documentation as needed

5. Test your changes
   ```bash
   npm run test
   npm run lint
   ```

6. Push your changes
   ```bash
   git push origin feature/my-feature
   ```

## Styleguides

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line
* Consider starting the commit message with an applicable emoji:
    * 🎨 `:art:` when improving the format/structure of the code
    * 🐛 `:bug:` when fixing a bug
    * 📝 `:memo:` when writing docs
    * ✨ `:sparkles:` when adding a new feature
    * ⚡️ `:zap:` when improving performance
    * 🔒 `:lock:` when dealing with security

### JavaScript/TypeScript Styleguide

* Use TypeScript for all new code
* Use 2 spaces for indentation
* Use semicolons
* Use meaningful variable names
* Document complex code sections
* Follow the existing code style

### Documentation Styleguide

* Use [Markdown](https://guides.github.com/features/mastering-markdown/)
* Reference functions, classes, and modules in backticks
* Use code blocks for examples
* Keep documentation up to date with code changes

## Community

* Join our [Discord server](#) for discussions
* Follow us on [Twitter](#) for updates
* Subscribe to our [newsletter](#) for important announcements

## Questions?

Feel free to contact the project maintainers if you have any questions. We're here to help!

## Attribution

This Contributing Guide is adapted from the open-source contribution guidelines for [Facebook's Draft](https://github.com/facebook/draft-js/blob/master/CONTRIBUTING.md).
