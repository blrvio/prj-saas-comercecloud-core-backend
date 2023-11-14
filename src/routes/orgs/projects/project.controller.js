const { FastifyRequest, FastifyReply } = require('fastify');
const { Project } = require('../../../models/project.model');
const {
  connectDb,
  disconnectDb,
} = require('../../../services/database/common.database');
const {
  checkUUIDFromToken,
} = require('../../../services/database/plugins.database');
const { Organization } = require('../../../models/organization.model');

async function createProject(request, reply) {
  console.log('createProject', request.body);
  try {
    const user_uuid = await request.user.appuid;
    const { orgId } = request.params; // Pegando o ssorgId do path

    // Conectando ao banco
    //await connectDb();

    // Verificando se a organização existe e se o usuário tem as devidas permissões
    const organization = await Organization.findOne({ id: orgId });
    if (!organization) {
      return reply.code(404).send({ error: 'Organization not found' });
    }

    const iamData = organization.resource_data.iam;
    if (
      !iamData.write_users.includes(user_uuid) &&
      iamData.owner_user !== user_uuid
    ) {
      return reply.code(403).send({ error: 'Permission denied' });
    }

    // Criando o projeto
    const projectData = {
      name: request.body.name,
      description: request.body.description,
      thumbnail_url: "https://images.unsplash.com/photo-1542626991-cbc4e32524cc",
      resource_data: {
        org_id: orgId,
        apis_enabled: [],
        iam: {
          owner_user: user_uuid,
        },
      },
      kind: 'orgresources:project',
    };

    const newProject = new Project(projectData);
    await newProject.save();

    // Adicionando o ID do projeto ao objeto da organização
    if (!organization.projects) {
      organization.projects = [];
    }
    organization.projects.push(newProject._id); // Assumindo que os projetos na organização são armazenados como uma lista de IDs
    await organization.save();

    // Retornando o projeto criado
    reply.code(201).send(newProject);
  } catch (error) {
    console.log(error);
    reply.code(500).send({ error: error.message });
  } finally {
    //await disconnectDb();
  }
}

async function readProject(request, reply) {
  try {
    const user_uuid = await checkUUIDFromToken(request.user);
    const projectId = request.params.id;

    // Conectando ao banco
    //await connectDb();

    // Buscando o projeto pelo ID
    const project = await Project.findOne({ id: projectId });
    if (!project) {
      return reply.code(404).send({ error: 'Project not found' });
    }

    // Pegando a organização associada ao projeto
    const orgId = project.resource_data.org_id;
    const organization = await Organization.findOne({ id: orgId });
    if (!organization) {
      return reply
        .code(404)
        .send({ error: 'Organization associated with the project not found' });
    }

    // Verificando as permissões do usuário na organização
    const orgIamData = organization.resource_data.iam;
    const projectIamData = project.resource_data.iam;

    const hasOrgPermission =
      orgIamData.read_users.includes(user_uuid) ||
      orgIamData.write_users.includes(user_uuid) ||
      orgIamData.owner_user === user_uuid;

    const hasProjectPermission =
      projectIamData.read_users.includes(user_uuid) ||
      projectIamData.write_users.includes(user_uuid) ||
      projectIamData.owner_user === user_uuid;

    if (!hasOrgPermission && !hasProjectPermission) {
      return reply.code(403).send({ error: 'Permission denied' });
    }

    // Se o usuário tem permissão de leitura na organização ou no projeto, ele pode ler detalhes do projeto
    reply.code(200).send(project);
  } catch (error) {
    reply.code(500).send({ error: error.message });
  } finally {
    //await disconnectDb();
  }
}

// Controller for reading data about all projects of a specific user
async function readAllProjects(request, reply) {
  try {
    const user_uuid = await checkUUIDFromToken(request.user);
    //await connectDb();
    console.log(request.params);
    const projects = await Project.find({
      'resource_data.org_id': request.params.orgId,
      $or: [
        { 'resource_data.iam.read_users': user_uuid },
        { 'resource_data.iam.write_users': user_uuid },
        { 'resource_data.iam.owner_user': user_uuid },
      ],
    }).exec();
    if (projects) {
      reply.code(200).send(projects);
    } else {
      reply.code(404).send({ error: 'Projects not found' });
    }
  } catch (error) {
    reply.code(500).send({ error: error.message });
  } finally {
    //await disconnectDb();
  }
}

// Controller for updating a specific project
async function updateProject(request, reply) {
  try {
    const user_uuid = await checkUUIDFromToken(request.user);
    const projectId = request.params.id;
    const updateData = request.body;
    //await connectDb();
    const project = await Project.findOneAndUpdate(
      {
        id: projectId,
        $or: [
          { 'resource_data.iam.write_users': user_uuid },
          { 'resource_data.iam.owner_user': user_uuid },
        ],
      },
      updateData,
      { new: true },
    ).exec();
    if (project) {
      reply.code(200).send(project);
    } else {
      reply.code(403).send({ error: 'Forbidden' });
    }
  } catch (error) {
    reply.code(500).send({ error: error.message });
  } finally {
    //await disconnectDb();
  }
}

// Controller for deleting a specific project
async function deleteProject(request, reply) {
  try {
    const user_uuid = await checkUUIDFromToken(request.user);
    const projectId = request.params.id;
    //await connectDb();
    const project = await Project.findOneAndDelete({
      id: projectId,
      'resource_data.iam.owner_user': user_uuid,
    }).exec();
    if (project) {
      reply.code(200).send({ message: 'Project deleted successfully' });
    } else {
      reply.code(403).send({ error: 'Forbidden' });
    }
  } catch (error) {
    reply.code(500).send({ error: error.message });
  } finally {
    //await disconnectDb();
  }
}

module.exports = {
  createProject,
  readProject,
  updateProject,
  deleteProject,
  readAllProjects,
};
