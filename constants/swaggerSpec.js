export const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Flora Bouquet API',
    version: '1.0.0',
    description: 'Public and administrative endpoints for the Flora Bouquet catalogue.',
  },
  components: {
    schemas: {
      Bouquet: {
        type: 'object',
        required: [
          'id',
          'photoURL',
          'title',
          'description',
          'price',
          'favorite',
          'createdAt',
          'updatedAt',
        ],
        properties: {
          id: { type: 'integer', example: 1 },
          photoURL: { type: 'string', format: 'uri', example: 'https://res.cloudinary.com/demo/image/upload/v1/flora/spring-elegance.jpg' },
          title: { type: 'string', example: 'Spring Elegance' },
          description: { type: 'string', example: 'A delicate blend of peonies, tulips, and roses.' },
          price: { type: 'number', format: 'double', example: 35.0 },
          favorite: { type: 'boolean', example: false },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Error: {
        type: 'object',
        required: ['message'],
        properties: {
          message: { type: 'string', example: 'Validation failed' },
          details: {
            type: 'array',
            items: { type: 'string' },
            example: ['"id" must be a positive integer'],
          },
        },
      },
    },
  },
  paths: {
    '/api/bouquets': {
      get: {
        summary: 'List all Bouquets',
        tags: ['Bouquets'],
        responses: {
          '200': {
            description: 'Array of Bouquets',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Bouquet' },
                },
              },
            },
          },
        },
      },
    },
    '/api/bouquets/{id}': {
      get: {
        summary: 'Get one Bouquet by id',
        tags: ['Bouquets'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer', minimum: 1 },
          },
        ],
        responses: {
          '200': {
            description: 'Bouquet',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Bouquet' },
              },
            },
          },
          '400': {
            description: 'Invalid identifier',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          '404': {
            description: 'Bouquet not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
  },
};
