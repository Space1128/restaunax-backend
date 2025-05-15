/**
 * Order Service Module
 * Handles all order-related operations including creation, retrieval, and updates
 * Uses Prisma ORM for database operations
 */

import { PrismaClient, OrderType, OrderStatus, Prisma } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

/**
 * Interface representing an individual item in an order
 */
export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  specialInstructions?: string;
}

/**
 * Data Transfer Object for creating a new order
 */
export interface CreateOrderDTO {
  customerName: string;
  customerEmail: string;
  orderType: OrderType;
  items: OrderItem[];
  scheduledFor?: string;
  preparationNotes?: string;
}

/**
 * Data Transfer Object for updating an existing order
 */
export interface UpdateOrderDTO {
  status?: OrderStatus;
  preparationNotes?: string;
}

/**
 * Interface for filtering orders in search queries
 */
export interface OrderFilters {
  status?: OrderStatus;
  orderType?: OrderType;
  search?: string;
}

export class OrderService {
  private prisma: PrismaClient;

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || new PrismaClient();
  }

  /**
   * Retrieves a paginated list of orders with optional filters
   * @param page - Current page number
   * @param limit - Number of items per page
   * @param filters - Optional filters for status, type, and search terms
   * @returns Paginated order list with total count and page information
   */
  async findAll(page: number, limit: number, filters: OrderFilters) {
    const skip = (page - 1) * limit;
    
    // Construct the where clause based on provided filters
    const where: Prisma.OrderWhereInput = {
      ...(filters.status && { status: filters.status }),
      ...(filters.orderType && { orderType: filters.orderType }),
      ...(filters.search && {
        OR: [
          // Search in customer name
          {
            customerName: {
              contains: filters.search,
              mode: 'insensitive' as Prisma.QueryMode
            }
          },
          // Search in customer email
          {
            customerEmail: {
              contains: filters.search,
              mode: 'insensitive' as Prisma.QueryMode
            }
          },
          // Search in item names
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
          // Search in preparation notes
          {
            preparationNotes: {
              contains: filters.search,
              mode: 'insensitive' as Prisma.QueryMode
            }
          },
        ]
      })
    };

    // Execute parallel queries for orders and total count
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        skip,
        take: limit,
        where,
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Retrieves a specific order by its ID
   * @param id - The unique identifier of the order
   * @throws AppError if order is not found
   * @returns The order with its items
   */
  async findById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      throw new AppError(404, 'Order not found');
    }

    return order;
  }

  /**
   * Creates a new order in the system
   * @param data - The order data including customer info and items
   * @returns The created order with its items
   */
  async create(data: CreateOrderDTO) {
    // Calculate the total price of the order
    const total = data.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    return this.prisma.order.create({
      data: {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        orderType: data.orderType,
        status: "pending",
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

  /**
   * Updates an existing order
   * @param id - The unique identifier of the order to update
   * @param data - The data to update (status and/or preparation notes)
   * @returns The updated order with its items
   */
  async update(id: string, data: UpdateOrderDTO) {
    console.log(data);
    return this.prisma.order.update({
      where: { id },
      data,
      include: { items: true },
    });
  }
} 