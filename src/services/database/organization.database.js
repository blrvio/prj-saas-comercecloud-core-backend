const { Organization } = require('../../models/organization.model');
const { connectDb, disconnectDb } = require('./common.database');

/**
 * Creates a new organization.
 *
 * @param {Object} data - The data for the organization.
 * @returns {Promise<Object>} - The created organization.
 */
async function createOrganization(data) {
  //await connectDb();
  const organization = new Organization({ resource_data: data });
  disconnectDb();
  return await organization.save();
}

/**
 * Gets an organization by ID.
 *
 * @param {string} id - The ID of the organization.
 * @returns {Promise<Object|null>} - The organization or null if not found.
 */
async function getOrganizationById(id) {
  //await connectDb();
  return await Organization.findById(id)
    .exec()
    .finally(() => disconnectDb());
}

/**
 * Lists all organizations.
 *
 * @returns {Promise<Object[]>} - The list of organizations.
 */
async function listOrganizations() {
  //await connectDb();
  return await Organization.find()
    .exec()
    .finally(() => disconnectDb());
}

/**
 * Updates an organization.
 *
 * @param {string} id - The ID of the organization.
 * @param {Object} data - The data to update.
 * @returns {Promise<Object|null>} - The updated organization or null if not found.
 */
async function updateOrganization(id, data) {
  //await connectDb();
  return await Organization.findByIdAndUpdate(
    id,
    { resource_data: data },
    { new: true },
  )
    .exec()
    .finally(() => disconnectDb());
}

/**
 * Deletes an organization.
 *
 * @param {string} id - The ID of the organization.
 * @returns {Promise<Object|null>} - The deleted organization or null if not found.
 */
async function deleteOrganization(id) {
  //await connectDb();
  return await Organization.findByIdAndDelete(id)
    .exec()
    .finally(() => disconnectDb());
}

module.exports = {
  createOrganization,
  getOrganizationById,
  listOrganizations,
  updateOrganization,
  deleteOrganization,
};
