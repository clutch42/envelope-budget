// swagger.js
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Envelope Budget API',
      version: '1.0.0',
      description: 'API for managing budgeting envelopes and transactions',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['./routes/*.js'], // adjust if your routes live elsewhere
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
