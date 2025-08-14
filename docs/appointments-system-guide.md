# Beyblade Appointment Management System – Technical Guide

> **Module code-name:** `appointments`

This guide describes how to build, configure and extend the new appointment system within **@msys-cursor-workshop**, using **@guestbox** and **@red-cross-poc** as architectural references.

---

## 1. High-Level Architecture

```mermaid
flowchart TD
    subgraph Client Apps
        A1(Web) -->|REST| B(API)
        A2(Mobile) -->|REST| B
    end
    subgraph Appointments API (Express)
        B --> C[Appointments Module]
        B --> D[Auth Module]
        B --> E[Payment Module]
    end
    C -->|Postgres| DB[(appointments*, arenas, participants, payments)]
    C -->|Redis| Q[Queues (BullMQ)]
    E --Stripe Webhook--> P[Stripe]
    Q --> W[Workers]
    W --> R[Resend Email]
```

---

## 2. Repository Layout

```
msys-cursor-workshop/
├── api/                              # Backend (Node.js/Express)
│   ├── src/
│   │   ├── modules/
│   │   │   ├── appointments/
│   │   │   │   ├── controllers/
│   │   │   │   ├── services/
│   │   │   │   ├── routes/
│   │   │   │   ├── models/
│   │   │   │   ├── workers/
│   │   │   │   ├── schemas.ts        # Zod definitions
│   │   │   │   └── index.ts         # Module bootstrap
│   │   │   ├── auth/                 # Authentication module
│   │   │   └── payments/             # Payment processing
│   │   └── app.js                    # Express app setup
│   ├── package.json
│   └── knexfile.js
├── core/                             # Frontend (React/Vite)
│   ├── src/
│   │   └── features/
│   │       └── appointments/         # React components & hooks
│   ├── package.json
│   └── vite.config.ts
└── mobile/                           # Mobile (React Native/Expo)
    ├── src/
    │   └── features/
    │       └── appointments/         # React Native components
    └── package.json
```

---

## 3. Environment Variables

| Variable                | Description                      |
| ----------------------- | -------------------------------- |
| `STRIPE_SECRET_KEY`     | Server secret for PaymentIntents |
| `STRIPE_WEBHOOK_SECRET` | Signature verification           |
| `RESEND_API_KEY`        | Email sending via Resend         |
| `REDIS_URL`             | BullMQ queues                    |
| `DATABASE_URL`          | PostgreSQL connection string     |
| `JWT_SECRET`            | Token signing secret             |

Add them to `.env` in `msys-cursor-workshop/api`.

---

## 4. Database Schema

See the Knex migration in `api/src/modules/appointments/migrations/20250101000000_init_appointments.js` (mirrors PRD section). Key points:

- GIST exclusion constraint on `(arena_id, tstzrange(starts_at, ends_at))` prevents overlaps.
- Unique `(appointment_id, user_id)` enforces one booking per player.
- `payments.stripe_intent` must be unique for idempotency.

---

## 5. Validation Middleware (Zod)

```ts
import { validate } from "@/modules/_shared/validate";
import { createAppointmentSchema } from "./schemas";

router.post("/", validate(createAppointmentSchema), ctrl.create);
```

Implementation of `validate` lives in `src/modules/_shared/validate.ts` and attaches `req.validated`.

---

## 6. Core Flows

### 6.1 Booking Flow

1. **POST `/appointments/:id/book`**
2. `AppointmentService.book()` acquires `FOR UPDATE` row lock on appointment.
3. If space available ➜ insert participant `state=booked`; else `state=waitlisted`.
4. For paid slots, `PaymentService.createIntent()` returns `clientSecret` to client.
5. Queue `appointment_confirmation` email.

### 6.2 Payment Confirmation

1. Stripe calls **POST `/payments/stripe/callback`**.
2. Signature verified → `payments` table updated `status=paid`.
3. Participant row updated `state=booked_paid`.
4. Queue `payment_receipt` email + promote from wait-list if slot opens.

### 6.3 Wait-list Promotion (Worker)

Cron every minute:

```ts
await db.transaction(async trx => {
  const appt = await getNextOpenSlot(trx);
  if (!appt) return;
  const next = await popWaitlisted(trx, appt.id);
  if (!next) return;
  await markBooked(trx, next.id);
  await notificationSvc.queueEmail({...});
});
```

---

## 7. API Endpoints

| Method | Path                             | Auth      | Description              |
| ------ | -------------------------------- | --------- | ------------------------ |
| POST   | `/api/appointments`              | Organizer | Create appointment       |
| PATCH  | `/api/appointments/:id`          | Organizer | Update/cancel            |
| GET    | `/api/appointments/calendar`     | Any       | List slots by date range |
| POST   | `/api/appointments/:id/book`     | Player    | Book slot                |
| POST   | `/api/appointments/:id/check-in` | Organizer | Mark attendance          |
| GET    | `/api/appointments/mine`         | Player    | List my upcoming         |

---

## 8. Front-End Hooks & Components

| File                                   | Purpose                               |
| -------------------------------------- | ------------------------------------- |
| `hooks/_useAppointmentsQuery.ts`       | Fetch & cache appointment list        |
| `hooks/_useBookAppointment.ts`         | Trigger booking + Stripe flow         |
| `components/AppointmentFormDialog.tsx` | Create/edit modal using shadcn Dialog |
| `components/AppointmentWidget.tsx`     | Embeddable widget on Tournament page  |
| `pages/appointments/index.tsx`         | Organizer dashboard                   |

Remember to use **shadcn/ui Dialog** components and **toast** utilities from **react-hot-toast**.

---

## 9. Local Development

```bash
# 1. Install dependencies & migrate
cd msys-cursor-workshop/api
npm install
npm run migrate

# 2. Start Redis (for BullMQ)
docker compose up redis -d

# 3. Start workers
npm run worker:dev

# 4. Start API server
npm run dev

# 5. Web front-end
cd ../core && npm install && npm run dev

# 6. Mobile app (optional)
cd ../mobile && npm install && npm run start
```

---

## 10. Testing & Quality

- **Unit tests** – Jest in `appointments/__tests__` (service logic).
- **Integration** – Supertest for route validation & booking flow.
- **E2E** – Playwright script for full browser flow (optional v1).
- **Coverage goal:** ≥ 80 % lines in module.

---

## 11. Extension Points (v2+)

- Multi-day events (`parent_event_id` & recurrences table).
- Discord channels (pluggable via NotificationService).
- Arena resource calendar ICS export.
- AI matchmaking for tournament seeding.
- SMS notifications integration.

---

## 12. Contacts

- **Product Owner:** You (Gaming Venue)
- **Engineering Lead:** TBD
- **Slack:** #beyblade-appointments
- **Docs:** `<this repo>/docs`
