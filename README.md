# Pitlane 

**Pitlane** is a digital garage — a full-stack web and mobile application that centralises all your vehicle maintenance responsibilities in one place. Track services, manage alerts for upcoming maintenance, and monitor costs across your entire fleet.

**Live:** [pitlaneapp.net](https://www.pitlaneapp.net) — try it instantly with the **demo account**, no registration required.

---

## Features

- **Vehicle management** — add and manage multiple vehicles with mileage tracking
- **Maintenance history** — log services with date, mileage, cost and notes
- **Alert system** — automated CRITICAL / WARNING / NONE status based on km and time thresholds
- **Cost dashboard** — spending breakdown by category and vehicle, filterable by month, year or all time
- **Google OAuth2** — sign in with Google or with email/password
- **Bilingual** — Portuguese and English (i18next)
- **Mobile app** — Android app built with Capacitor
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
| Capacitor | Android app wrapper |

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
| GitHub Actions | CI/CD |

---

## Architecture Decisions

**JWT stateless** — no server-side session storage, scales horizontally without shared state. Trade-off: tokens cannot be invalidated before expiry, mitigated with short expiration and refresh token support.

**DTOs on every API boundary** — decouples the API contract from the database schema, prevents lazy-loading serialisation issues, and keeps the response shape stable across internal refactors.

**Flyway migrations** — every schema change is versioned and reproducible. Any developer can run `docker-compose up` and have a fully migrated database in seconds.

**Costs stored in cents (Integer)** — avoids floating point precision issues. Frontend divides by 100 for display.

**Alert status calculated server-side** — CRITICAL / WARNING / NONE computed in a single-pass loop over active alerts on every request, ensuring the frontend always receives pre-computed status without additional queries.

**Mileage invariant enforced at model level** — `Vehicle.setCurrentMileage()` throws `IllegalArgumentException` if the new value is lower than the current one, preventing invalid state regardless of which service calls it.

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
│   │   ├── controller/     # REST endpoints
│   │   ├── service/        # Business logic
│   │   ├── repository/     # Data access
│   │   ├── model/          # JPA entities
│   │   ├── dto/            # Data transfer objects
│   │   ├── security/       # JWT filter, auth entry point
│   │   └── config/         # Security config, OAuth2 handler
│   └── src/main/resources/
│       └── db/migration/   # Flyway SQL migrations
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
