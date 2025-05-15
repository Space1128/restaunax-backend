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

### Running with Docker Compose

1. Build and start the containers:
   ```bash
   docker-compose -p restaunax-server up --build
   ```

2. Run migrations in the Docker container:
   ```bash
   docker-compose -p restaunax-server exec app npx prisma migrate dev
   ```

3. Run seed in the Docker container:
   ```bash
   docker-compose -p restaunax-server exec app npx prisma db seed
   ```

4. Access the application:
   - API will be available at `http://localhost:5001`
   - Database will be accessible at `localhost:5432`

### Development Workflow with Docker

1. Start the services:
   ```bash
   docker-compose up
   ```

2. View logs:
   ```bash
   docker-compose logs -f
   ```

3. Stop the services:
   ```bash
   docker-compose down
   ```

4. Rebuild after dependencies change:
   ```bash
   docker-compose up --build
   ```

### Running Tests in Docker

We use a separate Docker Compose configuration for testing to isolate the test environment from development.

1. Start the test environment:
   ```bash
   # Start test containers
   docker-compose -f docker-compose.test.yml -p restaunax-test up -d
   ```

2. Install Database in the Docker container:
   ```bash
   docker-compose -f docker-compose.test.yml -p restaunax-test exec app npx prisma migrate dev
   ```

3. Run the tests:
   ```bash
   # Run all tests
   docker-compose -f docker-compose.test.yml -p restaunax-test exec app npm run test:all

   # Run only unit tests
   docker-compose -f docker-compose.test.yml -p restaunax-test exec app npm run test:unit

   # Run only integration tests
   docker-compose -f docker-compose.test.yml -p restaunax-test exec app npm run test:integration
   ```

4. View test logs:
   ```bash
   # View test database logs
   docker-compose -f docker-compose.test.yml -p restaunax-test  logs test-db

   # View application test logs
   docker-compose -f docker-compose.test.yml -p restaunax-test logs app
   ```

5. Clean up test environment:
   ```bash
   # Stop and remove test containers
   docker-compose -f docker-compose.test.yml -p restaunax-test down
   ```

### Test Database Configuration

The test environment uses a separate PostgreSQL instance:
- Port: 5433 (to avoid conflicts with dev database)
- Database: restaunax_test
- Username: postgres
- Password: postgres

To manually connect to the test database:
```bash
docker-compose -f docker-compose.test.yml -p restaunax-test exec test-db psql -U postgres -d restaunax_test
```

### Troubleshooting Docker Setup

1. If the database connection fails:
   - Ensure the database container is running: `docker-compose ps`
   - Check database logs: `docker-compose logs db`
   - Verify environment variables in docker-compose.yml

2. If the application fails to start:
   - Check application logs: `docker-compose logs app`
   - Ensure all required environment variables are set
   - Verify the database migration status

3. If tests fail in Docker:
   - Verify test database is ready: `docker-compose -f docker-compose.test.yml exec test-db pg_isready`
   - Check test database connection: `docker-compose -f docker-compose.test.yml exec app npx prisma db push --preview-feature`
   - Ensure proper test cleanup: `docker-compose -f docker-compose.test.yml down -v && docker-compose -f docker-compose.test.yml up -d`
