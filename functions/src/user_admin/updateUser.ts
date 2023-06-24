import {CallableContext} from 'firebase-functions/lib/common/providers/https';
import {UpdateUser} from '../types';
import {authorizeForRole, firebaseAuthErrorHandling} from '../util';
import {runValidator, updateUserValidator} from '../validation';
import {https} from 'firebase-functions';
import {auth} from '../firebaseadmin';

export const updateUserHandler = async (data: UpdateUser, context: CallableContext) => {
  await authorizeForRole(context, 'admin');

  try {
    runValidator(data, updateUserValidator);
  } catch (e) {
    throw new https.HttpsError('invalid-argument', (e as Error).message);
  }

  try {
    const user = await auth.updateUser(data.uid, {
      email: data.email,
      displayName: data.displayName,
    })

    // add claims
    if (data.roles) {
      await auth.setCustomUserClaims(user.uid, {roles: data.roles});
    }

    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      disabled: user.disabled,
      metadata: user.metadata,
      roles: data.roles ?? user.customClaims?.roles,
    };
  } catch (e) {
    firebaseAuthErrorHandling(e);
  }

  return {success: false};
}
