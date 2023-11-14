import {CallableRequest} from 'firebase-functions/lib/common/providers/https';
import type {UpdateUser} from '../types';
import {authorizeForRole, firebaseAuthErrorHandling} from '../util';
import {runValidator, updateUserValidator} from '../validation';
import {https} from 'firebase-functions';
import {auth} from '../firebaseadmin';

export const updateUserHandler = async (request: CallableRequest) => {
  await authorizeForRole(request.auth, 'admin');

  try {
    runValidator(request.data, updateUserValidator);
  } catch (e) {
    throw new https.HttpsError('invalid-argument', (e as Error).message);
  }

  const data = request.data as UpdateUser;

  try {
    const user = await auth.updateUser(data.uid, {
      email: data.email,
      displayName: data.displayName,
    })

    // add claims
    if (data.roles) {
      await auth.setCustomUserClaims(user.uid, {roles: data.roles});
    } else {
      await auth.setCustomUserClaims(user.uid, null);
    }

    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      disabled: user.disabled,
      metadata: user.metadata,
      roles: data.roles,
    };
  } catch (e) {
    firebaseAuthErrorHandling(e);
  }

  return {success: false};
}
