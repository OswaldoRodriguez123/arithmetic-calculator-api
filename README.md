# Arithmetic Calculator API

[![tests](https://github.com/OswaldoRodriguez123/arithmetic-calculator-api/actions/workflows/tests.yml/badge.svg?branch=master)](https://github.com/OswaldoRodriguez123/arithmetic-calculator-api/actions/workflows/tests.yml)

REST API for an arithmetic calculator: users authenticate with JWT, run
operations from a catalog, and every operation is stored as a record that
charges credits from the user's balance.

- **Auth**: `POST /api/v1/auth/login` returns a JWT; protected routes require
  `Authorization: Bearer <token>`.
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
| `POST` | `/api/v1/auth/login` | no | Log in and get a JWT. |
| `GET` | `/api/v1/operations` | yes | List the operation catalog. |
| `GET` | `/api/v1/records` | yes | List records (`page`, `rowsPerPage`, `sortField`, `sortOrder`, `search`). |
| `POST` | `/api/v1/records` | yes | Run an operation and store the record. |
| `DELETE` | `/api/v1/records/:id` | yes | Soft-delete a record. |

## Setup

```bash
npm install
cp example.env .env
```

Fill in `.env`:

```text
PORT=3001
DATABASE_NAME=arithmetic_calculator
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
```

Create the database, then start the development server so Sequelize syncs the
tables:

```bash
npm run dev
```

The API listens on `http://localhost:3001` (configurable with `PORT`). Load the
seed data from [`src/queries/queries.sql`](src/queries/queries.sql) to create an
example user and the operation catalog.

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
with Jest mocks. The records controller suite imports the Sequelize models, so
it needs a reachable PostgreSQL instance configured through the `DATABASE_*`
variables; CI starts one as a service.

## License

MIT. See [LICENSE](LICENSE).
