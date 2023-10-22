const { FastifyPluginAsync } = require('fastify');

const root = async fastify => {
  fastify.get('/', async function () {
    return { root: true };
  });
};

module.exports = root;
