# Agricultural Equipment Leasing Platform

## Overview

HARVTECH is a mobile-first agricultural equipment leasing platform designed specifically for Indian farmers. The application supports bilingual functionality (English and Tamil) and operates with two distinct user roles: Owners (who list agricultural equipment for lease) and Users (farmers who lease equipment). The platform facilitates equipment rental transactions for tractors, weeders, and tillers, providing a marketplace that connects equipment owners with farmers who need agricultural machinery.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom agricultural-themed color palette
- **State Management**: TanStack Query for server state and React Context for client state
- **Routing**: Wouter for lightweight client-side routing
- **Internationalization**: Custom context-based solution supporting English and Tamil

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints with proper HTTP status codes
- **Authentication**: OpenID Connect (OIDC) integration with Replit authentication
- **Session Management**: Express sessions with PostgreSQL storage using connect-pg-simple
- **Middleware**: Custom logging, error handling, and authentication middleware

### Database Architecture
- **Database**: PostgreSQL with Neon serverless driver
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema**: Relational design with three main entities:
  - Users table (supports both owner and user roles)
  - Equipment table (linked to owners)
  - Bookings table (tracks rental transactions)
  - Sessions table (for authentication state)
- **Migrations**: Drizzle Kit for schema management

### Mobile-First Design
- **Responsive Design**: Tailwind CSS mobile-first approach
- **Touch Interactions**: Optimized for mobile touch interfaces
- **Progressive Enhancement**: Works on both mobile and desktop browsers

### Security Architecture
- **Authentication**: OIDC-based authentication with session management
- **Authorization**: Role-based access control (Owner vs User)
- **Data Validation**: Zod schema validation on both client and server
- **CSRF Protection**: Secure session handling with HTTP-only cookies

### Payment Integration
- **QR Code System**: Mock QR code generation for payment confirmation
- **Booking Management**: State tracking for equipment rental transactions

## External Dependencies

### Core Infrastructure
- **Neon Database**: Serverless PostgreSQL database hosting
- **Replit Authentication**: OpenID Connect authentication provider
- **Replit Development**: Development environment and deployment platform

### Frontend Libraries
- **React Query**: Server state management and caching
- **Radix UI**: Unstyled accessible UI components
- **Tailwind CSS**: Utility-first CSS framework
- **Wouter**: Lightweight React router
- **Lucide React**: Icon library

### Backend Dependencies
- **Express.js**: Web application framework
- **Drizzle ORM**: TypeScript ORM for PostgreSQL
- **OpenID Client**: OIDC authentication implementation
- **Passport.js**: Authentication middleware
- **Zod**: Schema validation library

### Development Tools
- **Vite**: Frontend build tool and development server
- **TypeScript**: Type safety across the application
- **ESBuild**: Backend bundling for production
- **PostCSS**: CSS processing with Tailwind

### Email Integration
- **Mail Client Integration**: Help functionality opens default email client with pre-filled support email

### Image Handling
- **Unsplash**: External image service for equipment placeholder images
- **Custom QR Generation**: Canvas-based QR code generation for payments