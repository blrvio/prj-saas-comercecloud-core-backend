const fp = require('fastify-plugin');
const helmet = require('@fastify/helmet');
const rateLimit = require('@fastify/rate-limit');
const cors = require('@fastify/cors');

module.exports = fp(async fastify => {
  fastify.register(helmet); // Adds security headers
  fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });
  await fastify.register(cors, {
    // put your options here
    origin: '*',
  });
  //   fastify.register(require('@fastify/auth'));
  //   fastify.register(require('fastify-acl-auth'));
});
