# Beyblade Appointment Management System (B-AMS) – Product Requirements Document

## 1. Purpose

The Beyblade Appointment Management System enables gaming venues to schedule, manage and monetize single-day Beyblade tournaments and practice sessions. It prevents arena double-booking, handles optional entry fees, automates wait-lists and confirmations, and provides organizers with visibility into upcoming events.

## 2. Background / Problem Statement

Gaming venues currently lack dedicated time-slot booking systems for Beyblade tournaments. Organizers juggle spreadsheets, leading to schedule conflicts, missed payments and frustrated players. This system will be built as a new standalone platform, using **@guestbox** and **@red-cross-poc** as architectural references for best practices.

## 3. Goals / Objectives

1. Allow players to self-book tournament or practice slots.
2. Provide organizers a dashboard to create, edit or cancel appointments.
3. Enforce capacity & time conflict rules per arena.
4. Support optional paid appointments with online card payments (Stripe).
5. Deliver automated email confirmations, updates and cancellations.
6. Expose core metrics (attendance, revenue, no-show rate).

## 4. Non-Goals (v1)

• Multi-day events (handled in v2).  
• Discord notifications (post-launch enhancement).  
• Cross-game resource balancing (future enhancement).

## 5. Target Users & Personas

| Persona         | Needs                                                                        |
| --------------- | ---------------------------------------------------------------------------- |
| **Player**      | Quickly find available slots, receive confirmations, pay fees.               |
| **Organizer**   | Create/manage appointments, monitor capacity, check-in players, see revenue. |
| **Judge**       | View assigned matches & check-ins (future).                                  |
| **Venue Admin** | High-level reports, arena utilization stats.                                 |

## 6. User Stories (MVP extract)

1. _As a Player_, I can view upcoming Beyblade events and reserve a slot so that I’m guaranteed play time.
2. _As an Organizer_, I can define an arena’s capacity and operating hours so that the system auto-generates valid time slots.
3. _As a Player_, I receive an email confirmation immediately after booking so that I know my reservation is secured.
4. _As an Organizer_, I can cancel an appointment and all participants are notified.
5. _As a Player_, if the event is full I can join a wait-list and be auto-promoted when a spot becomes available.
6. _As a Player_, I can pay the entry fee online to finalize my booking.

## 7. Functional Requirements (v1)

1. Appointment CRUD (create, update, cancel).
2. Conflict detection (no overlapping time range per arena).
3. Capacity limit & wait-list promotion.
4. Check-in workflow with no-show marking.
5. Stripe payment intent creation & webhook processing.
6. Email notifications via Resend.
7. Organizer dashboard & player widget (web + mobile).
8. Basic reporting: upcoming schedule, attendance %, revenue.

## 8. Non-Functional Requirements

| Category      | Requirement                                                   |
| ------------- | ------------------------------------------------------------- |
| Performance   | Booking round-trip < 300 ms (p95) under 500 concurrent users  |
| Concurrency   | Prevent race conditions on last slot via DB locking           |
| Security      | JWT auth, Stripe webhook signature, PCI compliance via Stripe |
| Availability  | 99.9 % uptime target                                          |
| Observability | Structured logs, Sentry error reporting                       |

## 9. Success Metrics

• Slot double-booking incidents = 0.  
• ≥ 95 % email delivery within 1 min.  
• ≥ 90 % booked capacity utilization after wait-list promotion.  
• < 3 % payment failure rate attributable to platform.  
• NPS ≥ 40 from player feedback.

## 10. Timeline & Milestones

| Week | Deliverable                        |
| ---- | ---------------------------------- |
| 1-2  | DB migrations, backend scaffolding |
| 3    | AppointmentService logic + tests   |
| 4    | Stripe integration & email queue   |
| 5    | Web dashboard & booking widget     |
| 6    | Mobile flow & wait-list cron       |
| 7    | Hardening, load tests, Sentry      |
| 8    | Beta rollout & polish              |

## 11. Assumptions & Dependencies

• PostgreSQL, Redis, Stripe and Resend services will be configured.  
• User authentication system will be built following @guestbox JWT patterns.  
• Arenas/tournaments are global but include `organizer_id` field.  
• Payment of entry fee is optional per appointment.

## 12. Risks & Mitigation

| Risk                        | Impact                     | Mitigation                                |
| --------------------------- | -------------------------- | ----------------------------------------- |
| Race condition on last slot | Double bookings            | DB GIST exclusion + transaction locks     |
| Email SPAM filters          | Players miss confirmations | Resend domain-validated sending, SPF/DKIM |
| Stripe webhook failures     | Payments not confirmed     | Automatic retries, idempotent keys        |

## 13. Glossary

_Appointment_ – A time-boxed slot in an arena.  
_Participant_ – A user linked to an appointment.  
_Arena_ – Physical Beyblade stadium with defined capacity.  
_MVP_ – Minimum Viable Product.
