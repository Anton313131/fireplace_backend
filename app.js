import express from 'express';
import morgan from 'morgan';
import { corsMiddleware } from './middleware/cors.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import { healthRouter } from './routes/health.js';

export const app = express();

app.use(morgan('combined'));
app.use(express.json());
app.use(corsMiddleware);

app.use('/health', healthRouter);

app.use(notFoundHandler);
app.use(errorHandler);
