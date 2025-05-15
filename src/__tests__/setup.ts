import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset } from 'jest-mock-extended';

// Mock PrismaClient
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn()
}));

// Create a mock instance
const prismaMock = mockDeep<PrismaClient>();

beforeEach(() => {
  mockReset(prismaMock);
});

export { prismaMock }; 