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
      BouquetUpdate: {
        type: 'object',
        additionalProperties: false,
        properties: {
          title: { type: 'string', example: 'Spring Elegance (renamed)' },
          description: { type: 'string', example: 'Updated description text.' },
          price: { type: 'number', format: 'double', minimum: 0.01, example: 39.5 },
          favorite: { type: 'boolean', example: true },
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
      BouquetPage: {
        type: 'object',
        required: ['data', 'total', 'page', 'limit', 'totalPages'],
        properties: {
          data: { type: 'array', items: { $ref: '#/components/schemas/Bouquet' } },
          total: { type: 'integer', example: 8 },
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 4 },
          totalPages: { type: 'integer', example: 2 },
        },
      },
      Testimonial: {
        type: 'object',
        required: ['id', 'name', 'text', 'createdAt', 'updatedAt'],
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Emma T.' },
          text: { type: 'string', example: 'Flora made my anniversary unforgettable!' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      TestimonialCreate: {
        type: 'object',
        required: ['name', 'text'],
        additionalProperties: false,
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100, example: 'Emma T.' },
          text: { type: 'string', minLength: 1, maxLength: 1000, example: 'Flora made my anniversary unforgettable!' },
        },
      },
    },
  },
  paths: {
    '/api/bouquets': {
      get: {
        summary: 'List Bouquets with optional filtering and pagination',
        tags: ['Bouquets'],
        parameters: [
          {
            name: 'favorite',
            in: 'query',
            required: false,
            schema: { type: 'boolean' },
            description: 'Filter by favorite state. Omit to return all.',
          },
          {
            name: 'page',
            in: 'query',
            required: false,
            schema: { type: 'integer', minimum: 1 },
            description: '1-based page number. Must be used together with limit.',
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            schema: { type: 'integer', minimum: 1, maximum: 100 },
            description: 'Page size. Must be used together with page.',
          },
        ],
        responses: {
          '200': {
            description: 'Without pagination: a plain JSON array of Bouquets. With page+limit: a paginated envelope.',
            content: {
              'application/json': {
                schema: {
                  oneOf: [
                    { type: 'array', items: { $ref: '#/components/schemas/Bouquet' } },
                    { $ref: '#/components/schemas/BouquetPage' },
                  ],
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
      put: {
        summary: 'Update a Bouquet (administrative)',
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
            'multipart/form-data': {
              schema: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  image: { type: 'string', format: 'binary', description: 'Optional replacement image (jpeg/png/webp/gif, ≤ 6 MB).' },
                  title: { $ref: '#/components/schemas/BouquetUpdate/properties/title' },
                  description: { $ref: '#/components/schemas/BouquetUpdate/properties/description' },
                  price: { $ref: '#/components/schemas/BouquetUpdate/properties/price' },
                  favorite: { $ref: '#/components/schemas/BouquetUpdate/properties/favorite' },
                },
              },
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
            description: 'Invalid identifier, body, file type, file size, or empty payload',
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
      delete: {
        summary: 'Delete a Bouquet and its media (administrative)',
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
        responses: {
          '204': {
            description: 'Bouquet deleted (Cloudinary cleanup is best-effort and never changes the response)',
          },
          '400': {
            description: 'Invalid identifier',
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
          '500': {
            description: 'Unexpected server error (database deletion failed)',
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
    '/api/testimonials': {
      get: {
        summary: 'List all Testimonials',
        tags: ['Testimonials'],
        responses: {
          '200': {
            description: 'Array of Testimonials',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Testimonial' } },
              },
            },
          },
        },
      },
      post: {
        summary: 'Submit a Testimonial (public)',
        tags: ['Testimonials'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TestimonialCreate' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Testimonial created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Testimonial' },
              },
            },
          },
          '400': {
            description: 'Invalid body',
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
