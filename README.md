#Lumiere Apartments

## Overview

Lumiere Apartments is a luxury apartment rental platform featuring property listings, booking management, user authentication, and role-based dashboards. The application serves customers looking to book apartments, administrators managing properties and bookings, and support staff handling maintenance requests.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state caching and synchronization
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Animations**: Framer Motion for page transitions and micro-interactions
- **Build Tool**: Vite with path aliases (@/ for client/src, @shared/ for shared)

### Backend Architecture
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript with ESM modules
- **API Pattern**: RESTful endpoints defined in shared/routes.ts with Zod validation
- **Authentication**: Passport.js with local strategy, session-based auth using express-session
- **Password Security**: scrypt hashing with random salts

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Schema Location**: shared/schema.ts (shared between frontend and backend)
- **Migrations**: Drizzle Kit with migrations output to /migrations
- **Session Store**: MemoryStore (development), connect-pg-simple available for production

### Shared Code Pattern
The /shared directory contains code used by both frontend and backend:
- **schema.ts**: Drizzle table definitions and Zod schemas (drizzle-zod)
- **routes.ts**: API route definitions with type-safe input/output schemas

### Role-Based Access
Four user roles with different permissions:
- **customer**: Can browse apartments, make bookings, submit maintenance requests
- **admin**: Full access to property management, booking oversight, analytics
- **manager**: Similar to admin with property management capabilities
- **support**: Handles maintenance requests and customer support tickets

### Key Pages
- Home: Property listings with filtering
- Apartment Details: Individual property view with booking calendar
- Profile: User dashboard with booking history
- Admin Dashboard: Analytics, booking management, property CRUD
- Support Dashboard: Maintenance request management

## External Dependencies

### Database
- PostgreSQL (required, connection via DATABASE_URL environment variable)
- Drizzle ORM for type-safe queries
- connect-pg-simple for production session storage

### UI Components
- shadcn/ui component library (Radix UI primitives)
- Recharts for admin analytics charts
- react-day-picker for booking calendar
- date-fns for date formatting
- embla-carousel-react for image carousels

### Authentication
- Passport.js with passport-local strategy
- express-session for session management


### Environment Variables Required
- DATABASE_URL: PostgreSQL connection string
- SESSION_SECRET: Secret key for session encryption (defaults to "lumiere_secret_key" in development)
