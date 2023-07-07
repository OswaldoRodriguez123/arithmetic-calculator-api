# Arithmetic Calculator REST API

## Setup

Make sure to install the dependencies:

```bash

# npm
npm install
```

1. Create a `.env` file on the root of the project based on `.env.example`
2. Create an app database based on `.env` DATABASE_NAME value.
3. Start the development server running `$ npm run dev` to synchronize database tables
4. Execute the queries provided in queries folder to create an example user and the records operations

## Development Server

Start the development server on `http://localhost:3001`

```bash
npm run dev
```
Port can be configured in .env file

## Production

Build the application for production:

```bash
npm run build
```

Locally preview production build:

```bash
npm run preview
```

## Documentation

Swagger documentation is in docs/api_services_v1.yml