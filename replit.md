# AfroWiki

## Overview

AfroWiki is a collaborative knowledge platform built with Next.js, TypeScript, and Prisma that focuses on documenting and preserving Black history, culture, and achievements. The application serves as an AI-enhanced encyclopedia featuring user-generated content, real-time collaboration, comprehensive article management, and intelligent content processing. It includes advanced features like fact-checking using OpenRouter API, collaborative editing with Yjs, branching workflows for content management, and a robust community system.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The application uses Next.js 15 with the App Router pattern and TypeScript for type safety. The UI is built with Tailwind CSS providing a dark-themed design optimized for readability. React components are organized into feature-based modules with client-side state management using React hooks and TanStack React Query for server state management. Framer Motion provides smooth animations throughout the interface.

### Backend Architecture
The backend leverages Next.js API routes for RESTful endpoints with server actions for form handling. Database operations use Prisma ORM with comprehensive models for articles, users, categories, tags, collaborations, and version control. Authentication is handled through NextAuth with support for multiple providers. The application implements role-based access control with user, editor, and admin roles.

### Data Storage Solutions
The primary database uses Prisma ORM with support for multiple database providers (currently configured for SQLite in development). Articles support rich metadata including media attachments, categorization, tagging, and version history. The system includes comprehensive schemas for user profiles, collaborative editing sessions, comments, and review workflows.

### Real-time Collaboration
Real-time collaborative editing is implemented using Yjs and WebSocket connections. The system includes a dedicated WebSocket server for document synchronization, cursor tracking, and live collaboration sessions. Branch management allows multiple versions of articles similar to Git workflows.

### Content Processing Pipeline
Articles undergo intelligent processing including markdown cleaning and normalization, automatic link generation for relevant terms, content quality analysis, and AI-powered fact-checking. The system supports media extraction and management with image processing capabilities.

### Caching and Performance
Multi-layer caching strategy includes Redis for production environments with fallback to in-memory caching using node-cache. Database queries are optimized with connection pooling and query caching. The application implements compression middleware and static asset optimization for improved performance.

## External Dependencies

### Core Framework Dependencies
- Next.js 15 for the full-stack React framework
- TypeScript for type safety and developer experience
- Tailwind CSS for styling and responsive design
- Prisma for database ORM and migrations

### Authentication and Security
- NextAuth for authentication with multiple provider support
- bcryptjs for password hashing and security
- @auth/prisma-adapter for database session management

### Real-time Collaboration
- Yjs ecosystem for collaborative editing (@tiptap/extension-collaboration)
- WebSocket server implementation for real-time synchronization
- TipTap editor with collaborative extensions for rich text editing

### AI and Content Processing
- OpenRouter API integration for AI fact-checking and content analysis
- OpenAI API for additional AI capabilities
- Natural language processing for content categorization

### Data Visualization and UI
- Chart.js with react-chartjs-2 for analytics dashboards
- Lucide React for consistent iconography
- Framer Motion for animations and transitions
- React Query for efficient data fetching and caching

### File and Media Management
- Next Cloudinary for image optimization and CDN
- Formidable for file upload handling
- Sharp for server-side image processing
- React Image Crop for image editing capabilities

### Development and Deployment Tools
- PM2 ecosystem configuration for production deployment
- Compression middleware for performance optimization
- CSV parsing capabilities for data import workflows
- Redis (ioredis) for production-grade caching