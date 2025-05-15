import { Request, Response, NextFunction } from 'express';
import { OrderStatus, OrderType } from '@prisma/client';
import { OrderService } from '../services/orderService';

// Create a single instance of OrderService with default Prisma client
const orderService = new OrderService();

export class OrderController {
  async getOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = '1', limit = '10', status, orderType, search } = req.query;
      const result = await orderService.findAll(
        parseInt(page as string),
        parseInt(limit as string),
        {
          ...(status && { status: status as OrderStatus }),
          ...(orderType && { orderType: orderType as OrderType }),
          ...(search && { search: search as string }),
        }
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await orderService.findById(req.params.id);
      res.json(order);
    } catch (error) {
      next(error);
    }
  }

  async createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderType, ...rest } = req.body;
      
      // Validate orderType
      if (!Object.values(OrderType).includes(orderType)) {
        res.status(400).json({
          status: 'error',
          message: 'Invalid order type. Must be either "delivery" or "pickup"'
        });
        return;
      }

      const order = await orderService.create({
        ...rest,
        orderType: orderType as OrderType,
      });
      res.status(201).json(order);
    } catch (error) {
      next(error);
    }
  }

  async updateOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, ...rest } = req.body;
        console.log(status);
      // Validate status if provided
      if (status && !Object.values(OrderStatus).includes(status)) {
        res.status(400).json({
          status: 'error',
          message: 'Invalid order status'
        });
        return;
      }

      const order = await orderService.update(req.params.id, {
        ...rest,
        ...(status && { status: status as OrderStatus }),
      });
      res.json(order);
    } catch (error) {
      next(error);
    }
  }
} 