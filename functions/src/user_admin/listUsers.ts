import type {CallableRequest} from 'firebase-functions/lib/common/providers/https';
import {authorizeForRole} from '../util';
import {auth} from '../firebaseadmin';

export const listUsersHandler = async (request: CallableRequest) => {
  await authorizeForRole(request.auth, 'admin');

  const usersResult = await auth.listUsers();
  return usersResult.users.map(u => {
    return {
      uid: u.uid,
      email: u.email,
      displayName: u.displayName,
      disabled: u.disabled,
      metadata: u.metadata,
      roles: u.customClaims?.roles,
    };
  });
};
