## Docker stuff:

```bash
$ docker compose up -d

$ docker compose down
```

just in case...

```bash
$ psql -U postgres -h localhost
```

## Migrations

```bash
$ npm run migration:generate -- db/migrations/NewMigration`
```

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
