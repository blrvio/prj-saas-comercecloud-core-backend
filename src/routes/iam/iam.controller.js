const { FastifyRequest, FastifyReply } = require('fastify');
const { Organization } = require('../../models/organization.model');
const {
  connectDb,
  disconnectDb,
} = require('../../services/database/common.database');
const {
  checkUUIDFromToken,
} = require('../../services/database/plugins.database');

/**
 * Adds a user to the organization with the specified permission.
 *
 * @param {FastifyRequest<{ Body: { userUUID: string, permissions: string[] }, Params: { orgId: string } }>} request
 * @param {FastifyReply} reply
 * @returns {Promise<void>}
 */
async function addUserToOrganization(request, reply) {
  try {
    const requesterUUID = request.user.appuid; // Adicionado para pegar o UUID do requerente
    const { userId, permissions } = request.body;
    const { orgId } = request.params;
    console.log(request.user);
    //await connectDb();
    let organization = await Organization.findOne({ id: orgId });

    if (!organization) {
      return reply.code(404).send({ error: 'Organization not found' });
    }
    // Certificando-se de que o requerente tem permissões 'write' ou 'owner'
    if (
      !organization.resource_data.iam.write_users.includes(requesterUUID) &&
      !organization.resource_data.iam.owner_user === requesterUUID
    ) {
      return reply.code(403).send({ error: 'Permission denied' });
    }

    // Adicionando usuário se ele não estiver já na lista de 'read'
    if (
      permissions.includes('read') &&
      !organization.resource_data.iam.read_users.includes(userId)
    ) {
      organization.resource_data.iam.read_users.push(userId);
      console.info('Adding user to read_users');
    }

    // Adicionando usuário se ele não estiver já na lista de 'write'
    if (
      permissions.includes('write') &&
      !organization.resource_data.iam.write_users.includes(userId)
    ) {
      console.info('Adding user to write_users');
      organization.resource_data.iam.write_users.push(userId);
    }

    // Add more permissions as needed
    await organization.save();
    reply
      .code(200)
      .send({ message: 'User added successfully', obj_data: organization });
  } catch (error) {
    console.log(error);
    reply.code(500).send({ error: error });
  } finally {
    //await disconnectDb();
  }
}

async function getUserPermissions(request, reply) {
  try {
    const requesterUUID = request.user.appuid; // Assumindo que você tem uma função como essa
    const { userUUID } = request.body;
    const { orgId } = request.params;

    //await connectDb();
    const organization = await Organization.findOne({ id: orgId });

    if (!organization) {
      return reply.code(404).send({ error: 'Organization not found' });
    }

    const iamData = organization.resource_data.iam;

    // Verifica se o requester tem alguma permissão na organização
    if (
      !iamData.read_users.includes(requesterUUID) &&
      !iamData.write_users.includes(requesterUUID) &&
      iamData.owner !== requesterUUID // Aqui ajustamos para checar a string diretamente
    ) {
      return reply.code(403).send({ error: 'Permission denied' });
    }

    let permissions = [];
    if (iamData.read_users.includes(userUUID)) permissions.push('read');
    if (iamData.write_users.includes(userUUID)) permissions.push('write');
    if (iamData.owner === userUUID)
      // Aqui ajustamos para checar a string diretamente
      permissions.push('owner');

    reply.code(200).send({ userUUID, permissions });
  } catch (error) {
    reply.code(500).send({ error: error });
  } finally {
    //await disconnectDb();
  }
}

/**
 * Modifies the permissions of a user within an organization.
 *
 * @param {FastifyRequest<{ Body: { orgId: string, userUUID: string, newPermission: string } }>} request
 * @param {FastifyReply} reply
 * @returns {Promise<void>}
 */
async function modifyUserPermissions(request, reply) {
  try {
    const { userId, permission } = request.body;
    const { orgId } = request.params;
    const requestingUserId = request.user.appuid; // assumindo que o ID do usuário fazendo a solicitação é armazenado em request.user.id

    //await connectDb();
    let organization = await Organization.findOne({ id: orgId });

    if (!organization) {
      return reply.code(404).send({ error: 'Organization not found' });
    }

    console.log(requestingUserId);

    // Verificar se o usuário que faz a solicitação é owner ou admin
    const isOwner =
      organization.resource_data.iam.owner_user === requestingUserId;
    const isAdmin =
      organization.resource_data.iam.write_users &&
      organization.resource_data.iam.write_users.includes(requestingUserId);

    if (!isOwner && !isAdmin) {
      return reply.code(403).send({ error: 'Permission denied' });
    }

    // Assuming that the user can only have one type of permission. Remove from all and then add to the new permission.
    ['read_users', 'write_users'].forEach(permissionType => {
      const index =
        organization.resource_data.iam[permissionType].indexOf(userId);
      if (index > -1) {
        organization.resource_data.iam[permissionType].splice(index, 1);
      }
    });

    if (permission === 'read') {
      organization.resource_data.iam.read_users.push(userId);
    } else if (permission === 'write') {
      organization.resource_data.iam.write_users.push(userId);
    } // Add more permissions as needed

    await organization.save();
    reply.code(200).send({ message: 'User permissions modified successfully' });
  } catch (error) {
    reply.code(500).send({ error: error });
  } finally {
    //await disconnectDb();
  }
}

/**
 * Removes a specific user from the organization.
 *
 * @param {FastifyRequest<{ Body: { orgId: string, userUUID: string } }>} request
 * @param {FastifyReply} reply
 * @returns {Promise<void>}
 */
async function removeUserFromOrganization(request, reply) {
  try {
    const { orgId, userId } = request.params;
    const requestingUserId = request.user.appuid; // assumindo que o ID do usuário fazendo a solicitação é armazenado em request.user.id

    //await connectDb();
    let organization = await Organization.findOne({ id: orgId });

    if (!organization) {
      return reply.code(404).send({ error: 'Organization not found' });
    }

    // Verificar se o usuário que faz a solicitação é owner ou admin
    const isOwner =
      organization.resource_data.iam.owner_user === requestingUserId;
    const isAdmin =
      organization.resource_data.iam.write_users &&
      organization.resource_data.iam.write_users.includes(requestingUserId);

    if (!isOwner && !isAdmin) {
      return reply.code(403).send({ error: 'Permission denied' });
    }

    // Remove the user from all permission types
    ['read_users', 'write_users'].forEach(permissionType => {
      const index =
        organization.resource_data.iam[permissionType].indexOf(userId);
      if (index > -1) {
        organization.resource_data.iam[permissionType].splice(index, 1);
      }
    });

    await organization.save();
    reply.code(200).send({ message: 'User removed successfully' });
  } catch (error) {
    reply.code(500).send({ error: error });
  } finally {
    //await disconnectDb();
  }
}

async function listAllPermissions(request, reply) {
  try {
    const requesterUUID = request.user.appuid; // Assumindo que você tenha uma função para recuperar o UUID a partir do token.
    const { orgId, projectId } = request.query; // Agora pegando os query parameters

    //await connectDb();

    let entity;
    if (orgId) {
      entity = await Organization.findOne({ id: orgId });
    } else if (projectId) {
      entity = await Project.findOne({ id: projectId }); // Assumindo que você tenha um modelo chamado "Project"
    } else {
      return reply
        .code(400)
        .send({ error: 'Either orgId or projectId should be provided' });
    }

    if (!entity) {
      return reply.code(404).send({ error: 'Entity not found' });
    }

    const iamData = entity.resource_data.iam;

    // Verifica se o requester tem alguma permissão na organização ou projeto
    if (
      !iamData.read_users.includes(requesterUUID) &&
      !iamData.write_users.includes(requesterUUID) &&
      iamData.owner !== requesterUUID
    ) {
      return reply.code(403).send({ error: 'Permission denied' });
    }

    let permissionsList = [];
    iamData.read_users.forEach(userUUID => {
      permissionsList.push({ id: userUUID, permission: 'read' });
    });
    iamData.write_users.forEach(userUUID => {
      permissionsList.push({ id: userUUID, permission: 'write' });
    });
    permissionsList.push({ id: iamData.owner_user, permission: 'owner' });

    const result = {
      id: entity.id,
      kind: entity.kind,
      resource_permissions: permissionsList,
    };

    reply.code(200).send(result);
  } catch (error) {
    reply.code(500).send({ error: error });
  } finally {
    //await disconnectDb();
  }
}

module.exports = {
  addUserToOrganization,
  getUserPermissions,
  modifyUserPermissions,
  removeUserFromOrganization,
  listAllPermissions,
};
