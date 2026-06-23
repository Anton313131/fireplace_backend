import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { env } from '../data/env.js';
import { swaggerSpec } from '../constants/swaggerSpec.js';

export const apiDocsRouter = Router();

const serverUrl =
  env.nodeEnv === 'production'
    ? 'https://flora-bouquet-backend.onrender.com'
    : `http://localhost:${env.port}`;

apiDocsRouter.use('/', swaggerUi.serve, swaggerUi.setup({ ...swaggerSpec, servers: [{ url: serverUrl }] }));
