# AfroWiki

<div align="center">

![AfroWiki Logo](public/bwikilogo.png)

An AI-driven encyclopedia focused on Black and African culture, knowledge, and history.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

## Overview

AfroWiki is a modern, AI-enhanced knowledge platform dedicated to documenting and preserving Black history, culture, and achievements worldwide. Our platform combines community-contributed content with AI-driven insights to provide a comprehensive and focused resource for exploring Black heritage and contemporary culture.

## Features

### Core Functionality

- **Authentication System**
  - Multiple sign-in options (GitHub, Email/Password)
  - Secure session management with JWT
  - User profile management with image upload
  - Role-based access control (User, Editor, Admin)

- **Content Management**
  - Article submission and review workflow
  - Advanced rich text editor with:
    - WYSIWYG editing interface
    - Live markdown preview
    - Split-screen editing mode
    - Code block syntax highlighting
    - Fullscreen editing mode
    - Keyboard shortcuts
  - Enhanced media management:
    - Drag and drop file uploads
    - Multiple file uploads
    - Image cropping and resizing
    - Automatic image optimization
    - File organization system
    - Media library with search and filtering
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
   git clone https://github.com/yourusername/AfroWiki.git
   cd AfroWiki
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
   # Database
   DATABASE_URL="file:./dev.db"

   # Authentication
   NEXTAUTH_SECRET="your-secret-key"
   GITHUB_ID="your-github-oauth-id"
   GITHUB_SECRET="your-github-oauth-secret"

   # Deployment (required in production)
   NEXT_PUBLIC_BASE_URL="http://localhost:3000"  # In development
   # NEXT_PUBLIC_BASE_URL="https://your-domain.com"  # In production
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
AfroWiki/
├── prisma/                # Database schema and migrations
├── public/               # Static assets
│   └── uploads/         # User-uploaded content
├── src/
│   ├── app/             # Next.js 14 app directory
│   │   ├── api/        # API routes
│   │   │   ├── admin/ # Admin-specific endpoints
│   │   │   ├── auth/  # Authentication endpoints
│   │   │   └── articles/ # Article management
│   │   ├── articles/   # Article pages
│   │   ├── auth/       # Authentication pages
│   │   ├── dashboard/  # User dashboard
│   │   ├── profile/    # User profile pages
│   │   └── settings/   # User settings
│   ├── components/     # Reusable React components
│   │   ├── articles/  # Article-related components
│   │   ├── dashboard/ # Dashboard components
│   │   ├── layout/    # Layout components
│   │   ├── ui/        # UI components
│   │   └── user/      # User-related components
│   └── lib/           # Utility functions and configurations
│       ├── auth.ts    # Authentication utilities
│       ├── config.ts  # Environment configuration
│       ├── db.ts      # Database client
│       └── factChecker.ts # AI fact-checking system
└── types/             # TypeScript type definitions
```

## Deployment

### Environment Setup

1. Configure your deployment platform (Render, DigitalOcean, etc.) with the required environment variables.
2. Set `NEXT_PUBLIC_BASE_URL` to your production domain (e.g., https://your-domain.com).
3. Ensure your database connection string is properly configured for production.

### Platform-Specific Notes

- The application uses dynamic base URL configuration for authentication redirects
- All authentication callbacks and redirects will use the `NEXT_PUBLIC_BASE_URL` value
- In development, it defaults to http://localhost:3000 if not set
- File uploads are stored in the `public/uploads` directory

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on how to submit pull requests, report issues, and contribute to the project.

### Development Workflow

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see above)
4. Run database migrations: `npx prisma migrate dev`
5. Start the development server: `npm run dev`
6. Make your changes
7. Run tests and linting: `npm run lint`
8. Submit a pull request

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
- All contributors who help make AfroWiki better
- The Black community for inspiring this project

## Contact

For questions or support, please open an issue in our GitHub repository.

---

<div align="center">
Made with ❤️ for the preservation and celebration of Black culture and history.
</div>
