import { Router } from 'express';
import { OrderController } from '../controllers/orderController';

const router = Router();
const orderController = new OrderController();

// GET /orders - List all orders with pagination and filtering
router.get('/', orderController.getOrders.bind(orderController));

// GET /orders/:id - Retrieve a specific order
router.get('/:id', orderController.getOrder.bind(orderController));

// PATCH /orders/:id - Update order status
router.patch('/:id', orderController.updateOrder.bind(orderController));

// POST /orders - Create a new order
router.post('/', orderController.createOrder.bind(orderController));

export const orderRoutes = router; 