import {Validator} from '../types';
import {CallableContext} from 'firebase-functions/lib/common/providers/https';
import {authorizeForRole} from '../util';
import {runValidator, validateNonEmptyString} from '../validation';
import {auth} from '../firebaseadmin';
import {https} from 'firebase-functions';

const deleteUserValidator: Validator<{ uid: string }> = {
  uid: {required: true, validate: validateNonEmptyString}
};

export const deleteUserHandler = async (data: { uid: string }, context: CallableContext) => {
  await authorizeForRole(context, 'admin');

  runValidator(data, deleteUserValidator);

  try {
    await auth.deleteUser(data.uid);
    return {success: true};
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
};
