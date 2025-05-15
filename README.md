# Restaurant Order Management System

## Overview
A robust backend service for managing restaurant orders, built with TypeScript and Prisma ORM. This system handles various types of orders, customer information, and order processing workflows.

## Features
- Order management (create, read, update)
- Flexible order filtering and pagination
- Support for different order types (dine-in, takeout, delivery)
- Order status tracking
- Customer information management
- Detailed order items handling
- Scheduled orders support
- Search functionality across multiple fields

## Technical Stack
- TypeScript
- Prisma ORM
- PostgreSQL (recommended database)
- Node.js
- Jest (testing framework)

## Project Structure
```
src/
├── services/
│   └── orderService.ts    # Core order management logic
├── middleware/
│   └── errorHandler.ts    # Custom error handling
├── __tests__/
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   ├── setup.ts         # Unit test setup with mocks
│   └── setupIntegration.ts # Integration test setup
└── ...
```

## Testing Strategy

### Test Structure
The project uses a dual-testing strategy with separate configurations for unit and integration tests:

#### Unit Tests (`/src/__tests__/unit/`)
- Uses Jest mock for Prisma client
- Fast execution, no database connection
- Tests business logic in isolation
- Located in `src/__tests__/unit/`

#### Integration Tests (`/src/__tests__/integration/`)
- Uses real database connection
- Tests complete request-response cycle
- Verifies database operations
- Located in `src/__tests__/integration/`

### Test Configuration
- `jest.config.unit.js`: Configuration for unit tests
- `jest.config.integration.js`: Configuration for integration tests
- `.env.test`: Environment variables for test database

### Running Tests

```bash
# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run all tests
npm run test:all
```

### Test Database Setup

1. Create a test database:
```sql
CREATE DATABASE restaunax_test;
```

2. Configure `.env.test`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/restaunax_test"
NODE_ENV="test"
```

3. Run migrations on test database:
```bash
dotenv -e .env.test -- npx prisma migrate deploy
```

## Setup and Installation
1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your database connection in `.env`:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/restaurant_db"
   PORT=5001
   ```

3. Run Prisma migrations:
   ```bash
   npx prisma migrate dev
   ```

4. Run Prisma seed:
   ```bash
   npx prisma db seed
   ```

5. Start the server:
   ```bash
   npm run dev
   ```

## API Documentation

### Order Service Methods

#### `findAll(page, limit, filters)`
Retrieves paginated orders with optional filters:
- `page`: Page number
- `limit`: Items per page
- `filters`: 
  - `status`: Filter by order status
  - `orderType`: Filter by order type
  - `search`: Search across customer name, email, and notes

#### `findById(id)`
Retrieves a specific order by ID with all related items.

#### `create(data)`
Creates a new order with the following data:
- `customerName`: Customer's name
- `customerEmail`: Customer's email
- `orderType`: Type of order (dine-in, takeout, delivery)
- `items`: Array of order items
- `scheduledFor`: Optional scheduled time
- `preparationNotes`: Optional preparation instructions

#### `update(id, data)`
Updates an existing order's status or preparation notes.

## Development Best Practices

### Testing Guidelines
1. Write unit tests for all business logic
2. Write integration tests for API endpoints
3. Use appropriate test database for integration tests
4. Clean up test data after each test
5. Mock external dependencies in unit tests

### Database Operations
1. Use transactions for multiple operations
2. Handle database errors appropriately
3. Clean up test data after integration tests
4. Use proper database indexes for performance

### Error Handling
The system uses a custom `AppError` class for standardized error handling across the application.

## Contributing
1. Fork the repository
2. Create your feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Create a pull request

## License
MIT License

## Docker Setup

### Prerequisites
- Docker
- Docker Compose

### Docker Configuration
The application can be run using Docker Compose, which sets up both the application and database containers.

### Running Tests in Docker

1. Build and start the containers:
   ```bash
   docker-compose up --build
   ```

2. Run tests in Docker:
```bash
# Start test database
docker-compose -f docker-compose.test.yml up -d test-db

# Wait for database to be ready
docker-compose -f docker-compose.test.yml exec test-db pg_isready -U postgres

# Run migrations on test database
docker-compose -f docker-compose.test.yml exec -e DATABASE_URL="postgresql://postgres:postgres@test-db:5432/restaunax_test" app npx prisma migrate deploy

# Run tests
docker-compose -f docker-compose.test.yml exec -e NODE_ENV=test -e DATABASE_URL="postgresql://postgres:postgres@test-db:5432/restaunax_test" app npm run test:all

# Stop test containers
docker-compose -f docker-compose.test.yml down
```

3. Run specific test suites:
```bash
# Run only unit tests
docker-compose -f docker-compose.test.yml exec app npm run test:unit

# Run only integration tests
docker-compose -f docker-compose.test.yml exec -e NODE_ENV=test -e DATABASE_URL="postgresql://postgres:postgres@test-db:5432/restaunax_test" app npm run test:integration
```

4. Watch test output in real-time:
```bash
# Run tests with watch mode
docker-compose -f docker-compose.test.yml exec app npm run test:watch
```

### Test Environment Variables in Docker
Create a `.env.test.docker` file:
```env
DATABASE_URL="postgresql://postgres:postgres@test-db:5432/restaunax_test"
NODE_ENV="test"
```

### Automated Test Workflow
Add these commands to your CI pipeline:
```bash
# Start fresh test environment
docker-compose -f docker-compose.test.yml down -v
docker-compose -f docker-compose.test.yml up -d test-db

# Wait for database and run tests
./scripts/wait-for-it.sh test-db:5432 -- npm run test:all
```

### Troubleshooting Tests in Docker

1. Database Connection Issues:
   ```bash
   # Check test database logs
   docker-compose -f docker-compose.test.yml logs test-db
   
   # Verify database connection
   docker-compose -f docker-compose.test.yml exec test-db psql -U postgres -d restaunax_test -c "\dt"
   ```

2. Test Execution Issues:
   ```bash
   # Check test container logs
   docker-compose -f docker-compose.test.yml logs app
   
   # Access test container shell
   docker-compose -f docker-compose.test.yml exec app sh
   ```

3. Common Solutions:
   - Ensure test database is ready before running tests
   - Verify environment variables are correctly passed
   - Check database migrations are applied
   - Ensure proper test cleanup between runs
