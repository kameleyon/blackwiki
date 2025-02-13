# BlackWiki

<div align="center">

![BlackWiki Logo](public/vercel.svg)

An AI-driven encyclopedia focused on Black and African culture, knowledge, and history.

[![Next.js](https://img.shields.io/badge/Next.js-13-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

## Overview

BlackWiki is a modern, AI-enhanced knowledge platform dedicated to documenting and preserving Black history, culture, and achievements worldwide. By combining Wikipedia's extensive database with community-contributed content and AI-driven insights, BlackWiki provides a comprehensive and focused resource for exploring Black heritage and contemporary culture.

## Features

### Core Functionality

- **Unified Search System**
  - Integration with Wikipedia API for broad knowledge base
  - Custom database for community-contributed content
  - Smart result ranking and categorization

- **Authentication & Authorization**
  - Multiple sign-in options (GitHub, Email/Password)
  - Role-based access control (User, Editor, Admin)
  - Secure session management

- **Modern UI/UX**
  - Clean, dark-themed interface
  - Responsive design for all devices
  - Smooth animations and transitions
  - Accessibility-focused implementation

### Upcoming Features

- Markdown-based content editing
- Version control for articles
- AI-powered content analysis
- Full-text search capabilities
- Community contribution system

See our [Progress Tracker](PROGRESS.md) for detailed development status.

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm or yarn
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/kameleyon/blackwiki.git
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
   Fill in the required environment variables:
   - `NEXTAUTH_SECRET`: Your NextAuth secret key
   - `GITHUB_ID`: GitHub OAuth app client ID
   - `GITHUB_SECRET`: GitHub OAuth app client secret
   - Additional variables as needed

4. Initialize the database:
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

Visit `http://localhost:3000` to see the application running.

## Project Structure

```
blackwiki/
├── prisma/               # Database schema and migrations
├── public/               # Static assets
├── src/
│   ├── app/             # Next.js 13 app directory
│   │   ├── api/         # API routes
│   │   ├── auth/        # Authentication pages
│   │   └── search/      # Search functionality
│   ├── components/      # Reusable React components
│   └── lib/            # Utility functions and configurations
├── .env                 # Environment variables
└── package.json        # Project dependencies and scripts
```

## Technology Stack

- **Frontend**
  - Next.js 13 (App Router)
  - React
  - Tailwind CSS
  - Framer Motion

- **Backend**
  - Next.js API Routes
  - Prisma ORM
  - SQLite Database

- **Authentication**
  - NextAuth.js
  - GitHub OAuth
  - Email/Password

- **Development Tools**
  - TypeScript
  - ESLint
  - Prettier

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on how to submit pull requests, report issues, and contribute to the project.

### Development Guidelines

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Run tests: `npm test`
5. Commit your changes: `git commit -m 'Add some feature'`
6. Push to the branch: `git push origin feature/your-feature-name`
7. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Wikipedia API for providing base knowledge content
- The open-source community for various tools and libraries
- All contributors who help make BlackWiki better

## Contact

For questions or support, please [open an issue](https://github.com/kameleyon/blackwiki/issues) on our GitHub repository.

---

<div align="center">
Made with ❤️ for the preservation and celebration of Black culture and history.
</div>
