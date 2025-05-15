import { prismaMock } from '../../setup';
import { OrderService } from '../../../services/orderService';
import { OrderStatus, OrderType } from '@prisma/client';

describe('OrderService', () => {
  let orderService: OrderService;

  beforeEach(() => {
    orderService = new OrderService(prismaMock);
  });

  describe('findAll', () => {
    it('should return paginated orders', async () => {
      const mockOrders = [
        {
          id: '1',
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          orderType: "delivery" as OrderType,
          status: "pending" as OrderStatus,
          total: 100,
          createdAt: new Date(),
          scheduledFor: null,
          preparationNotes: null
        }
      ];

      prismaMock.order.findMany.mockResolvedValue(mockOrders);
      prismaMock.order.count.mockResolvedValue(1);

      const result = await orderService.findAll(1, 10, {});

      expect(result.orders).toEqual(mockOrders);
      expect(result.total).toBe(1);
      expect(prismaMock.order.findMany).toHaveBeenCalled();
    });
  });

}); 