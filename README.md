# Beyblade Appointment Management System (B-AMS)

A comprehensive tournament booking and management system for gaming venues.

## Project Structure

```
msys-cursor-workshop/
├── api/                    # Backend API (Node.js/Express/TypeScript)
├── core/                   # Web Frontend (React/Vite/TypeScript)
├── docs/                   # Documentation
│   ├── appointments-prd.md
│   ├── appointments-system-guide.md
│   └── implementation-checklist.md
└── README.md
```

## Phase 0 - Boilerplate ✅

- [x] API boilerplate with Express, TypeScript, and essential middleware
- [x] Core frontend with React, Vite, Tailwind CSS v4, and shadcn/ui
- [x] Environment configuration files
- [x] Project documentation structure

## Quick Start

### Backend API

```bash
cd api
npm install
# Copy env.example to .env and configure
npm run dev
```

### Frontend Core

```bash
cd core
npm install
# Copy env.example to .env and configure
npm run dev
```

## Technology Stack

### Backend

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Knex.js
- **Queue**: Redis + BullMQ
- **Payment**: Stripe
- **Email**: Resend
- **Testing**: Jest + Supertest

### Frontend

- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State Management**: TanStack Query
- **Routing**: React Router
- **Forms**: React Hook Form + Zod
- **Testing**: Vitest + Testing Library

## Development Workflow

Follow the [Implementation Checklist](./docs/implementation-checklist.md) for phase-by-phase development.

## Documentation

- [Product Requirements Document](./docs/appointments-prd.md)
- [Technical Implementation Guide](./docs/appointments-system-guide.md)
- [Phase-by-Phase Checklist](./docs/implementation-checklist.md)

## License

MIT

