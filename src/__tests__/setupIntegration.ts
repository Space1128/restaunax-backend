import { PrismaClient } from '@prisma/client';

// Create a real Prisma client for integration tests
const prisma = new PrismaClient();

// Clean up database before all tests
beforeAll(async () => {
  try {
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
  } catch (error) {
    console.error('Failed to clean up test database:', error);
    throw error;
  }
});

// Clean up database and disconnect after all tests
afterAll(async () => {
  try {
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.$disconnect();
  } catch (error) {
    console.error('Failed to clean up and disconnect:', error);
    throw error;
  }
});

export { prisma }; 