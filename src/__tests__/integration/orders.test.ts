import request from 'supertest';
import app from '../../app';
import { OrderType } from '@prisma/client';
import { prisma } from '../setupIntegration';


describe('Orders API', () => {
  beforeAll(async () => {
    try {
      // Ensure connection is established
      await prisma.order.deleteMany();
      await prisma.orderItem.deleteMany();
      console.log('Test database cleared successfully');
    } catch (error) {
      console.error('Failed to setup test database:', error);
      throw error;
    }
  });

  afterAll(async () => {
    try {
      // Clean up test data
      await prisma.orderItem.deleteMany({});
      await prisma.order.deleteMany({});
      console.log('Test data cleaned up');
      
      // Disconnect from database
      await prisma.$disconnect();
      console.log('Database disconnected');
    } catch (error) {
      console.error('Failed to clean up:', error);
      // Try to disconnect even if cleanup failed
      try {
        await prisma.$disconnect();
      } catch (disconnectError) {
        console.error('Failed to disconnect:', disconnectError);
      }
      throw error;
    }
  });

  describe('POST /orders', () => {
    it('should create a new order', async () => {
      const orderData = {
        customerName: 'Test Customer',
        customerEmail: 'test@example.com',
        orderType: 'delivery' as OrderType,
        items: [
          {
            name: 'Test Item',
            quantity: 2,
            price: 10.99
          }
        ]
      };

      try {
        const response = await request(app)
          .post('/orders')
          .send(orderData)
          .expect(201);

        console.log('Response body:', JSON.stringify(response.body, null, 2));

        expect(response.body).toMatchObject({
          customerName: orderData.customerName,
          customerEmail: orderData.customerEmail,
          orderType: orderData.orderType,
          status: "pending"
        });

        // Verify order was created in database
        const order = await prisma.order.findUnique({
          where: { id: response.body.id },
          include: { items: true }
        });

        expect(order).toBeTruthy();
        expect(order?.items).toHaveLength(1);
      } catch (error) {
        console.error('Test failed with error:', error);
        if (error instanceof Error) {
          console.error('Error message:', error.message);
          console.error('Error stack:', error.stack);
        }
        throw error;
      }
    });
  });

  describe('GET /orders', () => {
    it('should return paginated orders', async () => {
      try {
        const response = await request(app)
          .get('/orders')
          .query({ page: 1, limit: 10 })
          .expect(200);

        expect(response.body).toHaveProperty('orders');
        expect(response.body).toHaveProperty('total');
        expect(Array.isArray(response.body.orders)).toBeTruthy();
      } catch (error) {
        console.error('Failed to get orders:', error);
        throw error;
      }
    });

    it('should filter orders by status', async () => {
      try {
        const response = await request(app)
          .get('/orders')
          .query({ status: "pending" })
          .expect(200);

        expect(response.body.orders).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              status: "pending"
            })
          ])
        );
      } catch (error) {
        console.error('Failed to filter orders:', error);
        throw error;
      }
    });
  });
}); 