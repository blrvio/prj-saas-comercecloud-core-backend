'use strict';

const fp = require('fastify-plugin');
const fastifyExpress = require('@fastify/express');
const Sentry = require('@sentry/node');

// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope

module.exports = fp(async function (fastify, opts) {
  fastify.register(fastifyExpress).after(() => {
    fastify.use(Sentry.Handlers.requestHandler());
    fastify.use(Sentry.Handlers.tracingHandler());
    fastify.use(Sentry.Handlers.errorHandler());
  });
});
