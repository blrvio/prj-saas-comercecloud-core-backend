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
 * Controller for creating a new organization.
 *
 * @param {FastifyRequest<{ Body: CreateOrganizationRequestBody }>} request - The Fastify request object
 * @param {FastifyReply} reply - The Fastify reply object
 * @returns {Promise<void>}
 */
async function createOrganization(request, reply) {
  console.log(request.user);

  try {
    const user_uuid = await checkUUIDFromToken(request.user);
    const orgData = {
      resource_data: {
        iam: {
          owner_user: user_uuid,
        },
      },
      name: request.body.name || '',
      description: request.body.description || '',
      thumbnail_url: request.body.thumbnail_url || '',
      business_category: request.body.business_category || '',
      kind: 'orgresources:organization',
    };
    //await connectDb();
    const newOrganization = new Organization(orgData);
    await newOrganization.save();
    reply.code(201).send(newOrganization);
  } catch (error) {
    reply.code(500).send({ error: error });
  } finally {
    //await disconnectDb();
  }
}

/**
 * Controller for reading data about a specific organization.
 *
 * @param {FastifyRequest<{ Params: { id: string } }>} request - The Fastify request object
 * @param {FastifyReply} reply - The Fastify reply object
 * @returns {Promise<void>}
 */
async function readOrganization(request, reply) {
  try {
    const user_uuid = await checkUUIDFromToken(request.user);
    const orgId = request.params.id;
    //await connectDb();
    const organization = await Organization.findOne({
      id: orgId,
      $or: [
        { 'resource_data.iam.read_users': user_uuid },
        { 'resource_data.iam.write_users': user_uuid },
        { 'resource_data.iam.owner_user': user_uuid },
      ],
    }).exec();
    if (organization) {
      reply.code(200).send(organization);
    } else {
      reply.code(403).send({ error: 'Forbidden' });
    }
  } catch (error) {
    reply.code(500).send({ error: error });
  } finally {
    //await disconnectDb();
  }
}

/**
 * Controller for reading data about all organizations.
 *
 *
 * @param {FastifyRequest} request - The Fastify request object
 * @param {FastifyReply} reply - The Fastify reply object
 * @returns {Promise<void>}
 */
async function readAllOrganizations(request, reply) {
  try {
    const user_uuid = await checkUUIDFromToken(request.user);
    //await connectDb();
    const organizationList = await Organization.find({
      $or: [
        { 'resource_data.iam.read_users': user_uuid },
        { 'resource_data.iam.write_users': user_uuid },
        { 'resource_data.iam.owner_user': user_uuid },
      ],
    }).exec();
    if (organizationList) {
      console.log(organizationList);
      reply.code(200).send(organizationList);
    } else {
      reply.code(404).send({ error: 'Organizations not found' });
    }
  } catch (error) {
    reply.code(500).send({ error: error });
  } finally {
    //await disconnectDb();
  }
}

/**
 * Controller for updating a specific organization.
 *
 * @param {FastifyRequest<{ Params: { id: string }, Body: object }>} request - The Fastify request object
 * @param {FastifyReply} reply - The Fastify reply object
 * @returns {Promise<void>}
 */
async function updateOrganization(request, reply) {
  try {
    const user_uuid = await checkUUIDFromToken(request.user);
    const orgId = request.params.id;
    const updateData = request.body;
    //await connectDb();
    const organization = await Organization.findOneAndUpdate(
      {
        id: orgId,
        $or: [
          { 'resource_data.iam.write_users': user_uuid },
          { 'resource_data.iam.owner_user': user_uuid },
        ],
      },
      updateData,
      { new: true },
    ).exec();
    if (organization) {
      reply.code(200).send(organization);
    } else {
      reply.code(403).send({ error: 'Forbidden' });
    }
  } catch (error) {
    reply.code(500).send({ error: error });
  } finally {
    //await disconnectDb();
  }
}

/**
 * Controller for deleting a specific organization.
 *
 * @param {FastifyRequest<{ Params: { id: string } }>} request - The Fastify request object
 * @param {FastifyReply} reply - The Fastify reply object
 * @returns {Promise<void>}
 */
async function deleteOrganization(request, reply) {
  try {
    const user_uuid = await checkUUIDFromToken(request.user);
    const orgId = request.params.id;
    //await connectDb();
    const organization = await Organization.findOneAndDelete({
      id: orgId,
      'resource_data.iam.owner_user': user_uuid,
    }).exec();
    if (organization) {
      reply.code(200).send({ message: 'Organization deleted successfully' });
    } else {
      reply.code(403).send({ error: 'Forbidden' });
    }
  } catch (error) {
    reply.code(500).send({ error: error });
  } finally {
    //await disconnectDb();
  }
}

module.exports = {
  createOrganization,
  readOrganization,
  updateOrganization,
  deleteOrganization,
  readAllOrganizations,
};
