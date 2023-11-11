'use strict';

if (
  process.env.NODE_ENV !== 'production' &&
  process.env.NODE_ENV !== 'homologation'
) {
  require('dotenv').config();
}
const apm = require('./services/apm.service');
const path = require('path');
const AutoLoad = require('@fastify/autoload');
const {connectDb} = require('./services/database/common.database');

// Pass --options via CLI arguments in command to enable these options.
module.exports.options = {};

module.exports = async function (fastify, opts) {
  // Place here your custom code!

  if (apm.isStarted()) {
    console.info('APM started');
    fastify.setErrorHandler(function (err, request, reply) {
      apm.captureError(err);
      reply.send(err);
    });
    fastify.setNotFoundHandler(function (request, reply) {
      const err = new Error('Route Not Found');
      apm.captureError(err);
      reply
        .code(404)
        .send({ error: 'Not Found', requested_route: request.url });
    });
  } else {
    console.info('APM not started');
  }

  await connectDb()

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: Object.assign({}, opts),
  });

  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: Object.assign({}, opts),
  });
};
