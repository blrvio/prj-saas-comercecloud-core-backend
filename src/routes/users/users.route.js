const { userResponseSchema } = require('../../models/openapi/users.oas');
const {
  createUser,
  readUser,
  updateUser,
  deleteUser,
} = require('./user.controller');

const usersRoutes = async fastify => {
  fastify.post('/', {
    schema: {
      description: 'Create a new user',
      tags: ['user'],
      response: userResponseSchema,
    },
    preHandler: fastify.checkAuth,
    handler: createUser,
  });

  // Rota para ler um usuário específico
  fastify.get('/:id', {
    schema: {
      description: 'Get information about a specific user',
      tags: ['user'],
      summary: 'Retrieve user details by ID',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'User ID' },
        },
      }
    },
    preHandler: fastify.checkAuth,
    handler: readUser,
  });

  // Rota para atualizar um usuário específico
  fastify.patch('/', {
    schema: {
      description: 'Update a specific user',
      tags: ['user'],
      body: {
        type: 'object',
        properties: {
          resource_data: {
            type: 'object',
            properties: {
              phone: {
                type: 'string',
                nullable: true,
                description: 'User phone number',
              },
            },
          },
          name: { type: 'string', nullable: true, description: 'User name' },
          description: {
            type: 'string',
            nullable: true,
            description: 'User description',
          },
          thumbnail_url: {
            type: 'string',
            format: 'uri',
            nullable: true,
            description: 'URL of the user thumbnail',
          },
        },
      },
      response: userResponseSchema,
    },
    preHandler: fastify.checkAuth,
    handler: updateUser,
  });

  // Rota para deletar um usuário específico
  fastify.delete('/', {
    schema: {
      description: 'Delete a specific user',
      tags: ['user'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'User ID' },
        },
      },
    },
    preHandler: fastify.checkAuth,
    handler: deleteUser,
  });
};

module.exports = usersRoutes;
