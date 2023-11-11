const { v4: uuidv4 } = require('uuid');
const { connectDb, disconnectDb } = require('./common.database');

/**
 * Generates a prefixed unique identifier using a UUID.
 *
 * @param {Object} options - The options for generating the prefixed identifier.
 * @param {string} options.prefix - The prefix to prepend to the UUID.
 * @returns {string} - The prefixed UUID.
 */
function idPrefixPlugin(options) {
  return options.prefix + uuidv4();
}

async function checkUUIDFromToken(user) {
  if (user.appuid) {
    return user.appuid;
  } else {
    //await connectDb();

    // Busca o usuário no banco de dados usando user.uid
    const foundUser = await User.findOne({ idp_uuid: user.uid }).exec();
    disconnectDb();
    if (foundUser) {
      return foundUser.id; // Retorna o campo id do usuário encontrado
    } else {
      throw new Error('User not found'); // Lança um erro se o usuário não for encontrado
    }
  }
}

module.exports = { idPrefixPlugin, checkUUIDFromToken };
