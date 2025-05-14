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

## Project Structure
```
src/
├── services/
│   └── orderService.ts    # Core order management logic
├── middleware/
│   └── errorHandler.ts    # Custom error handling
└── ...
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

## Data Models

### Order
```typescript
{
  id: string | number
  customerName: string
  customerEmail: string
  orderType: OrderType
  status: OrderStatus
  total: number
  scheduledFor?: Date
  preparationNotes?: string
  items: OrderItem[]
  createdAt: Date
}
```

### OrderItem
```typescript
{
  id: string | number
  name: string
  quantity: number
  price: number
  specialInstructions?: string
}
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

## Error Handling
The system uses a custom `AppError` class for standardized error handling across the application.

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

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
   docker-compose up --build
   ```

2. Run migrations in the Docker container:
   ```bash
   docker-compose exec app npx prisma migrate dev
   ```
2. Run seed in the Docker container:
  ```bash
  docker-compose exec app npx prisma db seed
  ```

3. Access the application:
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

### Troubleshooting Docker Setup

1. If the database connection fails:
   - Ensure the database container is running: `docker-compose ps`
   - Check database logs: `docker-compose logs db`
   - Verify environment variables in docker-compose.yml

2. If the application fails to start:
   - Check application logs: `docker-compose logs app`
   - Ensure all required environment variables are set
   - Verify the database migration status
