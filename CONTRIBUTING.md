# Contributing to Roamly

Thank you for your interest in contributing to Roamly! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/Roamly.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes locally
6. Commit your changes: `git commit -m "Add: description of your changes"`
7. Push to your fork: `git push origin feature/your-feature-name`
8. Create a Pull Request

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow the existing code structure and naming conventions
- Use functional components with hooks (no class components)
- Keep components small and focused on a single responsibility
- Add comments for complex logic

### Component Guidelines

- Place reusable components in `/components`
- Place page-specific components in the same directory as the page
- Use descriptive component names (e.g., `TripInputForm`, not `Form1`)
- Include TypeScript types/interfaces for all props

### Naming Conventions

- Components: PascalCase (e.g., `RecommendationCard.tsx`)
- Utilities: camelCase (e.g., `formatDuration`)
- Types/Interfaces: PascalCase (e.g., `TripPreferences`)
- Files: Match the component name or use kebab-case for utilities

### Commit Messages

Use conventional commit format:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Example: `feat: add price alert functionality`

## Testing

Before submitting a PR:
1. Test all affected pages locally
2. Verify responsive design (mobile, tablet, desktop)
3. Check for TypeScript errors: `npm run build`
4. Ensure no console errors or warnings

## Pull Request Process

1. Update the README.md if needed
2. Ensure your code follows the project's style guidelines
3. Add a clear description of what your PR does
4. Link any related issues
5. Wait for review and address any feedback

## Priority Areas for Contribution

### High Priority
- Real flight API integration
- User authentication system
- Database implementation
- Price tracking & alerts

### Medium Priority
- Additional filtering options
- Mobile app version
- Performance optimizations
- Accessibility improvements

### Nice to Have
- Multi-city trip support
- Hotel/car rental integration
- Social sharing features
- User reviews and ratings

## Questions?

If you have questions or need help:
- Open an issue with the `question` label
- Reach out to @AayushmanVibhu

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other contributors

Thank you for contributing to Roamly! 🚀
