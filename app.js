import express from 'express';
import morgan from 'morgan';
import { corsMiddleware } from './middleware/cors.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import { healthRouter } from './routes/health.js';
import { bouquetsRouter } from './routes/bouquets.js';
import { apiDocsRouter } from './routes/apiDocs.js';
import './models/index.js';

export const app = express();

app.use(morgan('combined'));
app.use(express.json());
app.use(corsMiddleware);

app.use('/health', healthRouter);
app.use('/api/bouquets', bouquetsRouter);
app.use('/api-docs', apiDocsRouter);

app.use(notFoundHandler);
app.use(errorHandler);
