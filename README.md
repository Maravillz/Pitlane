# Pitlane 🏎️
> Digital garage — centralise all your vehicle maintenance responsibilities in one place.

![Java](https://img.shields.io/badge/Java_21-ED8B00?style=flat&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot_3-6DB33F?style=flat&logo=spring&logoColor=white)
![Spring Security](https://img.shields.io/badge/Spring_Security-6DB33F?style=flat&logo=springsecurity&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL_16-316192?style=flat&logo=postgresql&logoColor=white)
![Flyway](https://img.shields.io/badge/Flyway-CC0200?style=flat&logo=flyway&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)
![React](https://img.shields.io/badge/React_18-20232A?style=flat&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_v4-38B2AC?style=flat&logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![Railway](https://img.shields.io/badge/Railway-0B0D0E?style=flat&logo=railway&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)

---

**Pitlane** is a full-stack web and Android application that solves a real problem: keeping a consistent maintenance history across multiple vehicles, with automated alerts before things go wrong and a clear picture of what you're actually spending.

Most people track this in WhatsApp messages, paper receipts, or not at all. Pitlane centralises it.

🌐 **Live:** [pitlaneapp.net](https://www.pitlaneapp.net) — try it instantly with the **demo account**, no registration required.

---

## Features

- **Vehicle management** — add and manage multiple vehicles with mileage tracking
- **Maintenance history** — log services with date, mileage, cost and notes
- **Alert system** — automated CRITICAL / WARNING / NONE status based on km and time thresholds
- **Cost dashboard** — spending breakdown by category and vehicle, filterable by month, year or all time
- **Google OAuth2** — sign in with Google or with email/password
- **Bilingual** — Portuguese and English (i18next)
- **Android app** — built with Capacitor on top of the same React codebase, no duplication
- **Demo account** — isolated demo session with automatic data reset

---

## Tech Stack

### Backend
| Technology | Usage |
|---|---|
| Java 21 | Primary language |
| Spring Boot 3.5 | Application framework |
| Spring MVC | REST API |
| Spring Security | Authentication and authorisation |
| JWT (jjwt 0.12) | Stateless token-based auth |
| Google OAuth2 | Social login |
| Spring Data JPA + Hibernate | ORM and data access |
| Flyway | Database schema versioning |
| PostgreSQL 16 | Primary database |
| Docker | Containerisation |

### Frontend
| Technology | Usage |
|---|---|
| React 18 + Vite | UI framework and build tool |
| TypeScript | Primary language |
| Tailwind CSS v4 | Utility-first styling with CSS variables design system |
| React Router | Client-side routing |
| i18next | Internationalisation (PT/EN) |
| Capacitor | Android app wrapper — wraps the same React build, zero logic duplication |

### Testing
| Layer | Framework | Tests |
|---|---|---|
| Services | JUnit 5 + Mockito | 44 |
| Repositories | JUnit 5 + @DataJpaTest + H2 | 20 |
| Controllers | JUnit 5 + MockMvc + Spring Security Test | 29 |
| Frontend components | Jest + React Testing Library | 75 |
| **Total** | | **168** |

### Infrastructure
| Service | Purpose |
|---|---|
| Railway | Backend + PostgreSQL hosting |
| Vercel | Frontend hosting |

---

## Architecture Decisions

**JWT stateless auth**
No server-side session storage — tokens are self-contained and validated on every request. This means the backend scales horizontally without any shared session state. The trade-off is that tokens cannot be revoked before expiry. I considered Redis-backed sessions for easier invalidation, but for a single-account-per-user app with 24h token expiry the operational overhead of adding a cache layer didn't justify it. Mitigated with short expiration and refresh token support.

**DTOs on every API boundary**
The API contract is fully decoupled from the database schema. This prevents Hibernate lazy-loading issues during serialisation, keeps response shapes stable across internal refactors, and means the frontend never sees raw entity structure. Any change to the domain model doesn't automatically become a breaking API change.

**Flyway for schema versioning**
Every schema change is a versioned SQL file committed alongside the code that needs it. Any developer — or a fresh Railway deployment — runs `docker-compose up` and gets a fully migrated database automatically. No manual steps, no "works on my machine" schema drift.

**Costs stored as Integer (cents)**
Floating point arithmetic on monetary values produces silent precision errors. Storing costs as cents (Integer) makes all calculations exact. The frontend divides by 100 for display only.

**Alert status computed server-side on every request**
CRITICAL / WARNING / NONE is calculated in a single-pass loop over the vehicle's active alerts before the response is sent. The frontend receives pre-computed status — no client-side logic, no additional queries, no stale state. At the current scale this is fast enough to not matter; if the fleet size grew significantly, this would move to a scheduled background job or an event-driven approach triggered on mileage updates.

**Mileage invariant enforced at the model layer**
`Vehicle.setCurrentMileage()` throws `IllegalArgumentException` if the new value is lower than the current one. This constraint lives in the domain model, not in a service or a controller — it cannot be bypassed regardless of which code path calls it.

**Swagger only in dev profile**
API documentation is available locally but disabled in production. Keeps the attack surface smaller and avoids exposing endpoint structure unnecessarily.

---

## Known Trade-offs and What I'd Do Differently at Scale

These are conscious decisions that made sense for a solo portfolio project, but would need revisiting in a production system with real growth:

- **No rate limiting** — the API has no request throttling. In production I'd add it at the gateway level or with Spring's `HandlerInterceptor`.
- **Alert recalculation is synchronous and per-request** — fine now, but with thousands of vehicles this would move to a scheduled job (`@Scheduled`) or become event-driven on mileage updates.
- **Demo data reset is a cron job** — works for one instance, but doesn't scale horizontally. A proper approach would use tenant isolation with scoped data per session.
- **No observability** — no structured logging, no metrics, no distributed tracing. I'd add Micrometer + a logging aggregator before taking this anywhere near production load.
- **Single-region deployment** — Railway runs in one region. No CDN for the API, no read replicas on the database.

---

## Getting Started

### Prerequisites

- Java 21
- Node.js 20+
- Docker and Docker Compose

### Running locally

**1. Clone the repository**
```bash
git clone https://github.com/Maravillz/Pitlane.git
cd Pitlane
```

**2. Start the database**
```bash
docker-compose up -d
```

**3. Configure the backend**

Copy and fill in the environment variables:
```bash
cp backend/src/main/resources/application.properties.example backend/src/main/resources/application.properties
```

Required variables:
```properties
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pitlane
DB_USER=pitlane
DB_PASSWORD=pitlane

# JWT — generate a secure random string (min 256 bits)
jwt.secret=your-secret-here
jwt.expiration=86400000

# Google OAuth2 — create credentials at console.cloud.google.com
spring.security.oauth2.client.registration.google.client-id=your-client-id
spring.security.oauth2.client.registration.google.client-secret=your-client-secret

# URLs
app.frontend-url=http://localhost:5173
app.backend-url=http://localhost:8081

# Alert thresholds
pitlane.alerts.warning-km-threshold=500
pitlane.alerts.warning-days-threshold=15
```

**4. Start the backend**
```bash
cd backend
./mvnw spring-boot:run
```

Flyway will automatically run all migrations on startup.

**5. Start the frontend**
```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Running Tests

**Backend (93 tests)**
```bash
cd backend
./mvnw test
```

**Frontend (75 tests)**
```bash
cd frontend
npm test
```

---

## Project Structure

```
Pitlane/
├── backend/
│   ├── src/main/java/com/pitlane/pitlane/
│   │   ├── controller/     # REST endpoints — thin layer, no business logic
│   │   ├── service/        # Business logic and orchestration
│   │   ├── repository/     # Data access via Spring Data JPA
│   │   ├── model/          # JPA entities and domain invariants
│   │   ├── dto/            # API contract — decoupled from entity structure
│   │   ├── security/       # JWT filter, auth entry point
│   │   └── config/         # Security config, OAuth2 handler
│   └── src/main/resources/
│       └── db/migration/   # Flyway SQL migrations — one file per schema change
├── frontend/
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── pages/          # Page-level components
│       ├── services/       # API client functions
│       ├── models/         # TypeScript interfaces
│       ├── hooks/          # Custom React hooks
│       ├── context/        # Auth context
│       └── utils/          # Utility functions
└── docker-compose.yml
```

---

## API Documentation

Swagger UI is available in development mode at `http://localhost:8081/swagger-ui/index.html`.

To enable it locally, run with the `dev` profile:
```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

---

## Demo Account

A demo account is available at [pitlaneapp.net/login](https://www.pitlaneapp.net/login) — click **"Ver demonstração"** to explore the app with pre-loaded data across three vehicles with different alert statuses (CRITICAL, WARNING and NONE).

Demo sessions are tracked and data is automatically reset daily at 20:00 UTC, or immediately on logout.

---

## License

This project is for portfolio purposes. All rights reserved.
