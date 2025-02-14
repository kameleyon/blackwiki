# BlackWiki

<div align="center">

![BlackWiki Logo](public/bwikilogo.png)

An AI-driven encyclopedia focused on Black and African culture, knowledge, and history.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

## Overview

BlackWiki is a modern, AI-enhanced knowledge platform dedicated to documenting and preserving Black history, culture, and achievements worldwide. Our platform combines community-contributed content with AI-driven insights to provide a comprehensive and focused resource for exploring Black heritage and contemporary culture.

## Features

### Core Functionality

- **Authentication System**
  - Multiple sign-in options (GitHub, Email/Password)
  - Secure session management with JWT
  - User profile management with image upload
  - Role-based access control (User, Editor, Admin)

- **Content Management**
  - Article submission and review workflow
  - Rich text editing with markdown support
  - Version control for content tracking
  - Category and tag organization
  - AI-powered content verification

- **Search & Discovery**
  - Advanced search with filters
  - Category-based browsing
  - Smart result ranking
  - Content recommendations

### Technical Features

- **Modern Stack**
  - Next.js 14 App Router
  - TypeScript for type safety
  - Prisma ORM for database management
  - Tailwind CSS for styling
  - Framer Motion for animations

- **Performance**
  - Server-side rendering
  - Optimized image handling
  - Responsive design
  - Dark mode by default

See our [Progress Tracker](PROGRESS.md) for detailed development status.

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm or yarn
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/blackwiki.git
   cd blackwiki
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Required environment variables:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   GITHUB_ID="your-github-oauth-id"
   GITHUB_SECRET="your-github-oauth-secret"
   ```

4. Initialize the database:
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`.

## Project Structure

```
blackwiki/
├── prisma/               # Database schema and migrations
├── public/              # Static assets
├── src/
│   ├── app/            # Next.js 14 app directory
│   │   ├── api/       # API routes
│   │   ├── articles/  # Article pages
│   │   ├── auth/      # Authentication pages
│   │   └── profile/   # User profile pages
│   ├── components/    # Reusable React components
│   │   ├── layout/   # Layout components
│   │   └── ui/       # UI components
│   └── lib/          # Utility functions and configurations
└── types/            # TypeScript type definitions
```

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on how to submit pull requests, report issues, and contribute to the project.

### Development Guidelines

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Run tests and linting: `npm run lint`
5. Commit your changes: `git commit -m 'Add feature'`
6. Push to your fork: `git push origin feature/your-feature`
7. Create a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- The open-source community for various tools and libraries
- All contributors who help make BlackWiki better
- The Black community for inspiring this project

## Contact

For questions or support, please open an issue in our GitHub repository.

---

<div align="center">
Made with ❤️ for the preservation and celebration of Black culture and history.
</div>
