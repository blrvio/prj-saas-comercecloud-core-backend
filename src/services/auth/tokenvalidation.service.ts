import { User as DbUser } from '../../models/user.model';
import { connectDb, disconnectDb } from '../database/common.database';

interface User {
  appuid?: string;
  uid: string;
}

async function getUIDFromToken(user: User) {
  if ('appuid' in user) {
    return user.appuid;
  } else {
    try {
      // Conecta ao banco de dados
      //await connectDb();

      // Procura um usuário cujo idp_uuid corresponda ao uid do usuário
      const dbUser = await DbUser.findOne({ idp_uuid: user.uid });
      if (dbUser) {
        // Se um usuário foi encontrado, retorna o id do usuário
        return dbUser.id;
      } else {
        throw new Error('User not found');
      }
    } catch (error) {
      console.error(error);
      throw error; // Re-lança o erro para ser capturado e tratado por quem chamou esta função
    } finally {
      // Desconecta do banco de dados
      disconnectDb();
    }
  }
}

export { getUIDFromToken };
