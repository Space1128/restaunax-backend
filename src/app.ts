import express, { ErrorRequestHandler } from 'express';
import cors from 'cors';
import { orderRoutes } from './routes/orderRoutes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/orders', orderRoutes);

// Error handling
app.use(errorHandler as ErrorRequestHandler);

export default app; 