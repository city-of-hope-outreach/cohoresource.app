import {CallableContext} from 'firebase-functions/lib/common/providers/https';
import {UpdateUser} from '../types';
import {authorizeForRole} from '../util';
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
    const firebaseError = e as {message?: string, code?: string};
    if (firebaseError.code) {
      if (firebaseError.code === 'auth/user-not-found') {
        throw new https.HttpsError('not-found', 'There is no user record for the provided UID.');
      } else {
        throw new https.HttpsError('internal', `Auth error: ${firebaseError.code}. ${firebaseError.message}`);
      }
    } else if (firebaseError.message) {
      throw new https.HttpsError('internal', `Unknown auth error: ${firebaseError.message}`);
    }
    throw new https.HttpsError('internal', `Unknown auth error: ${e}`);
  }
}
