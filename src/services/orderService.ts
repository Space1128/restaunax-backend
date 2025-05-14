import { PrismaClient, OrderType, OrderStatus, Prisma } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  specialInstructions?: string;
}

export interface CreateOrderDTO {
  customerName: string;
  customerEmail: string;
  orderType: OrderType;
  items: OrderItem[];
  scheduledFor?: string;
  preparationNotes?: string;
}

export interface UpdateOrderDTO {
  status?: OrderStatus;
  preparationNotes?: string;
}

export interface OrderFilters {
  status?: OrderStatus;
  orderType?: OrderType;
  search?: string;
}

export class OrderService {
  async findAll(page: number, limit: number, filters: OrderFilters) {
    const skip = (page - 1) * limit;
    
    const where: Prisma.OrderWhereInput = {
      ...(filters.status && { status: filters.status }),
      ...(filters.orderType && { orderType: filters.orderType }),
      ...(filters.search && {
        OR: [
          {
            customerName: {
              contains: filters.search,
              mode: 'insensitive' as Prisma.QueryMode
            }
          },
          {
            customerEmail: {
              contains: filters.search,
              mode: 'insensitive' as Prisma.QueryMode
            }
          },
          {
            items: {
              some: {
                name: {
                  contains: filters.search,
                  mode: 'insensitive' as Prisma.QueryMode
                }
              }
            }
          },
          {
            preparationNotes: {
              contains: filters.search,
              mode: 'insensitive' as Prisma.QueryMode
            }
          },
        ]
      })
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        skip,
        take: limit,
        where,
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      throw new AppError(404, 'Order not found');
    }

    return order;
  }

  async create(data: CreateOrderDTO) {
    const total = data.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    return prisma.order.create({
      data: {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        orderType: data.orderType,
        status: OrderStatus.pending,
        total,
        scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : null,
        preparationNotes: data.preparationNotes,
        items: {
          create: data.items,
        },
      },
      include: { items: true },
    });
  }

  async update(id: string, data: UpdateOrderDTO) {
    console.log(data);
    return prisma.order.update({
      where: { id },
      data,
      include: { items: true },
    });
  }
} 