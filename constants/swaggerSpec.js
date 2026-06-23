export const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Flora Bouquet API',
    version: '1.0.0',
    description: 'Public and administrative endpoints for the Flora Bouquet catalogue.',
  },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        description: 'Administrative API key (matches ADMIN_API_KEY).',
      },
    },
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
      BouquetCreate: {
        type: 'object',
        required: ['title', 'description', 'price'],
        properties: {
          title: { type: 'string', example: 'Spring Elegance' },
          description: { type: 'string', example: 'A delicate blend of peonies, tulips, and roses.' },
          price: { type: 'number', format: 'double', minimum: 0.01, example: 35.0 },
          favorite: { type: 'boolean', default: false, example: false },
        },
      },
      FavoriteUpdate: {
        type: 'object',
        required: ['favorite'],
        additionalProperties: false,
        properties: {
          favorite: { type: 'boolean', example: true },
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
      post: {
        summary: 'Create a Bouquet (administrative)',
        tags: ['Bouquets'],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['image', 'title', 'description', 'price'],
                properties: {
                  image: { type: 'string', format: 'binary', description: 'Image file (jpeg, png, webp, gif) up to 6 MB.' },
                  title: { $ref: '#/components/schemas/BouquetCreate/properties/title' },
                  description: { $ref: '#/components/schemas/BouquetCreate/properties/description' },
                  price: { $ref: '#/components/schemas/BouquetCreate/properties/price' },
                  favorite: { $ref: '#/components/schemas/BouquetCreate/properties/favorite' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Bouquet created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Bouquet' },
              },
            },
          },
          '400': {
            description: 'Invalid input, missing image, wrong type, or oversize file',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          '401': {
            description: 'Missing or incorrect Bearer token',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
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
    '/api/bouquets/{id}/favorite': {
      patch: {
        summary: 'Set a Bouquet\'s favorite state (administrative)',
        tags: ['Bouquets'],
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer', minimum: 1 },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/FavoriteUpdate' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Updated Bouquet',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Bouquet' },
              },
            },
          },
          '400': {
            description: 'Invalid identifier or body',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          '401': {
            description: 'Missing or incorrect Bearer token',
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
