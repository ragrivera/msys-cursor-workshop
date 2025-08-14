# Appointment Management System – Phase-by-Phase Implementation Checklist

> This checklist tracks every significant deliverable from environment setup through beta rollout. Tick each task as it is completed.

## Phase 0 – Repository & Environment Bootstrap

- [x] Clone repository and install root dependencies
- [x] Configure global ESLint/Prettier settings
- [x] Provision `.env.example` files for API, Core, and Mobile apps

## Phase 1 – Database & Backend Foundation (Weeks 1-2)

- [x] Design relational schema (`appointments`, `arenas`, `participants`, `payments`)
- [x] Create initial Knex migrations with exclusion constraints
- [x] Seed sample data for local development
- [x] Scaffold Express module structure with `modules/appointments`
- [x] Integrate JWT authentication middleware
- [x] CI: run migrations & unit tests on pull requests

## Phase 2 – Core Services & Business Rules (Week 3)

- [ ] Implement `AppointmentService` (CRUD, clash detection)
- [ ] Implement `ParticipantService` (booking, cancellation, check-in)
- [ ] Unit-test services to ≥ 80 % coverage
- [ ] Add BullMQ job for wait-list promotion
- [ ] Add Swagger/OpenAPI docs for new routes

## Phase 3 – Payments & Notifications (Week 4)

- [ ] Integrate Stripe PaymentIntents (server side)
- [ ] Verify Stripe webhook signatures & update payment state
- [ ] Create `PaymentService` tests & mocks
- [ ] Integrate Resend email templates (confirmation, receipt, cancellation)
- [ ] Queue email jobs inside BullMQ workers

## Phase 4 – Web Front-End Dashboard (Week 5)

- [ ] Implement React hooks `_useAppointmentsQuery` and `_useBookAppointment`
- [ ] Build `AppointmentFormDialog` with validation & shadcn/ui Dialog components
- [ ] Create `AppointmentWidget` embeddable component
- [ ] Add `/appointments` organizer dashboard page & sidebar entry
- [ ] Implement dark-theme tokens & toggle (Tailwind `selector` strategy)

## Phase 5 – Mobile Flow & Cron Jobs (Week 6)

- [ ] Scaffold Expo app feature screens (list, details, booking)
- [ ] Re-use shared hooks via React Query
- [ ] Schedule cron/worker for wait-list promotion every minute
- [ ] E2E booking flow on iOS & Android simulators

## Phase 6 – Observability, Hardening & Load Tests (Week 7)

- [ ] Add structured logging (pino) & request correlation IDs
- [ ] Integrate Sentry for error tracking (API & React)
- [ ] Add rate-limiting & helmet security headers
- [ ] Create k6 load test scripts targeting 500 concurrent users
- [ ] Optimize Postgres indexes and query plans

## Phase 7 – Beta Roll-Out & Polish (Week 8)

- [ ] Deploy staging stack (Docker Compose + Railway/Render)
- [ ] Run smoke tests & regression suite
- [ ] Collect organizer/player feedback & triage issues
- [ ] Polish copy, icons and accessibility
- [ ] Tag `v1.0.0` and publish release notes

---

### Continuous Tasks

- [ ] Keep documentation in `/docs` up-to-date
- [ ] Maintain code coverage ≥ 80 %
- [ ] Ensure CI pipeline stays green
- [ ] Address new security vulnerabilities within 48 h
