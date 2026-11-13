# Arithmetic Calculator API

[![tests](https://github.com/OswaldoRodriguez123/arithmetic-calculator-api/actions/workflows/tests.yml/badge.svg?branch=master)](https://github.com/OswaldoRodriguez123/arithmetic-calculator-api/actions/workflows/tests.yml)

REST API for an arithmetic calculator: users authenticate with JWT, run
operations from a catalog, and every operation is stored as a record that
charges credits from the user's balance.

- **Auth**: `POST /api/v1/auth/login` sets an httpOnly session cookie (the JWT
  is never exposed to JavaScript). Protected routes accept the cookie, or
  `Authorization: Bearer <token>` for non-browser tooling.
- **Operations**: a catalog of addition, subtraction, multiplication, division,
  square root and random string, each with a credit cost.
- **Records**: create an operation record, list it with pagination, sorting and
  search, and soft-delete it. Each record stores the operation response, the
  cost and the resulting user balance.

The full contract is in
[`src/docs/api_services_v1.yml`](src/docs/api_services_v1.yml) (OpenAPI 3.0).

## Stack

- Node.js + TypeScript
- Express
- Sequelize + PostgreSQL
- JWT (`jsonwebtoken`) and `bcryptjs`
- Zod for request validation
- Jest + ts-jest

## Endpoints

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/v1/auth/login` | no | Log in; sets the httpOnly `access_token` cookie (no token in the body). |
| `POST` | `/api/v1/auth/logout` | no | Clear the session cookie (idempotent). |
| `GET` | `/api/v1/auth/me` | yes | Return the caller's public profile (`{ id, name, username }`). |
| `GET` | `/api/v1/operations` | yes | List the operation catalog. |
| `GET` | `/api/v1/records` | yes | List records (`page`, `rowsPerPage`, `sortField`, `sortOrder`, `search`). |
| `POST` | `/api/v1/records` | yes | Run an operation and store the record. |
| `DELETE` | `/api/v1/records/:id` | yes | Soft-delete a record. |

### Cookie sessions

The browser SPA authenticates with an httpOnly cookie, so the JWT is never
available to JavaScript (closing the localStorage XSS exfiltration path).
Cookie flags: `HttpOnly; Path=/; Max-Age=<JWT_EXPIRATION_SECONDS>`, and
`SameSite=Lax` (development over plain http) or `SameSite=None; Secure`
(`NODE_ENV=production`, required when the SPA and the API live on different
sites, e.g. GitHub Pages → Render). `Secure` production cookies additionally
require HTTPS; Render provides that.

Because the SPA sends credentials cross-origin, CORS must name explicit
origins (a wildcard is incompatible with cookies) and the API refuses to
start in production without `CORS_ORIGIN`. CSRF is mitigated by design: the
API only parses JSON bodies (form posts arrive unparsed and fail validation)
and cross-origin `fetch` requires a preflight, which the origin allowlist
rejects; there are no state-changing `GET` routes.

## Setup

```bash
npm install
cp example.env .env
```

Fill in `.env` (see [`example.env`](example.env) for the full list):

```text
APP_PORT=3001
DATABASE_NAME=arithmetic_calculator
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
JWT_SECRET=<random-string-at-least-32-chars>
```

`JWT_SECRET` is required — the app refuses to start without it. Generate one
with `openssl rand -hex 32`.

Create the database, then start the development server so Sequelize syncs the
tables:

```bash
npm run dev
```

The API listens on `http://localhost:3001` (configurable with `APP_PORT`). Load the
seed data from [`src/queries/queries.sql`](src/queries/queries.sql) to create an
example user and the operation catalog.

### Environment variables

| Variable | Default | Required | Description |
| --- | --- | --- | --- |
| `APP_PORT` | `3001` | no | HTTP port. |
| `DATABASE_DIALECT` | `postgres` | no | Sequelize dialect. |
| `DATABASE_NAME` | `arithmetic_calculator` | no | Database name. |
| `DATABASE_USERNAME` | `postgres` | no | Database user. |
| `DATABASE_PASSWORD` | _(none)_ | **yes, in production** | Database password. The app throws at startup in production if it is missing. |
| `DATABASE_HOST` | `localhost` | no | Database host. |
| `DATABASE_PORT` | `5432` | no | Database port. |
| `JWT_SECRET` | _(none)_ | **yes** | HMAC key for signing tokens. |
| `JWT_SECRET_PREVIOUS` | _(none)_ | no | Previous key, accepted only for verification during a rotation. |
| `JWT_KID` | `v1` | no | `kid` header embedded in tokens. |
| `JWT_EXPIRATION_SECONDS` | `3600` | no | Token lifetime. |
| `CORS_ORIGIN` | `http://localhost:3000` (dev) | **yes, in production** | Comma-separated allowed origins for credentialed CORS. The app throws at startup in production if it is missing. `*` is a legacy open mode (no cookie sessions) and logs a warning. |
| `LOGIN_RATE_LIMIT_MAX` | `20` | no | Login requests per 15 min per IP. |
| `LOGIN_USERNAME_RATE_LIMIT_MAX` | `10` | no | Login requests per 15 min per username. |

### Token rotation

1. Deploy with `JWT_SECRET=<new-secret>` and `JWT_SECRET_PREVIOUS=<old-secret>`.
   New tokens are signed with the new secret; tokens signed with the old secret
   keep working until they expire.
2. After the old token lifetime (`JWT_EXPIRATION_SECONDS`) has elapsed,
   redeploy with `JWT_SECRET_PREVIOUS` empty.

### Operations notes

- **Soft-deleted records are not deleted.** `DELETE /api/v1/records/:id` sets
  `deleted_at`; the row stays in the table. To restore, an operator must run
  `UPDATE records SET deleted_at = NULL WHERE id = '<record-id>';` directly
  against the database.
- **No migrations.** Tables are created by `sequelize.sync()` at import time;
  there is no migration history. Schema changes require manual coordination.
- **Rate limits** are per-process (in-memory). Multi-instance deployments need
  an edge/WAF rule or a shared store to enforce a global limit.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Development server with `ts-node` |
| `npm run build` | Compile to `build/` |
| `npm start` | Run the compiled server |
| `npm test` | Jest |

## Tests

```bash
npm test
```

The suite covers the user, operation and record controllers and repositories
with Jest mocks; `NODE_ENV=test` skips `sequelize.sync()`, so no reachable
database is needed. CI additionally starts PostgreSQL as a service.

## License

MIT. See [LICENSE](LICENSE).
