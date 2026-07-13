# Integration Tests

## Setup

The integration tests use Vitest and require a test database to run.

### Environment Variables

The following environment variables are required for running integration tests:

- `DATABASE_URL`: Must point to a test database (e.g., `postgresql://user:password@localhost:5432/courier_collection_test`)
- `STAGE1_SIGNING_SECRET`: HMAC signing secret for webhook authentication
- `STAGE1_RAW_UPDATES_API_KEY`: API key for Stage1 to Stage2 webhook requests
- `STAGE2_WEBHOOK_URL`: (Optional) URL of Stage 2 webhook endpoint; can be mocked in tests

### Running Tests

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run specific test file
npm test webhook-integration.test.ts

# Run tests in watch mode
npm test --watch
```

## Test Database Setup

Tests automatically:
1. Apply pending Prisma migrations to the test database
2. Clear all tables between test runs
3. Create fixtures for test data

## Test Coverage

### webhook-integration.test.ts

Integration smoke test for the webhook round-trip flow:

1. **Package Creation & Webhook Queueing**: Verifies that creating a package automatically enqueues a webhook outbox entry
2. **Webhook Processing & Completion**: Tests successful processing of webhook outbox items
3. **Failure & Retry Logic**: Tests exponential backoff retry behavior on webhook failures
4. **Idempotent Queueing**: Ensures duplicate webhook requests are handled correctly
5. **Concurrent Processing**: Tests that already-claimed items are skipped
6. **Max Attempts**: Verifies that items beyond max attempts are not reprocessed
7. **Environment Variables**: Documents required env vars for CI

## CI Integration

To run tests in CI, ensure:

1. A test database is available at `DATABASE_URL`
2. All required environment variables are set
3. Migrations are applied before running tests

Example GitHub Actions setup:

```yaml
- name: Run integration tests
  env:
    DATABASE_URL: postgresql://test:test@localhost:5432/courier_collection_test
    STAGE1_SIGNING_SECRET: test-secret
    STAGE1_RAW_UPDATES_API_KEY: test-api-key
  run: npm test
```
