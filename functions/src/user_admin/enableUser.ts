import {CallableContext} from 'firebase-functions/lib/common/providers/https';
import {authorizeForRole, firebaseAuthErrorHandling} from '../util';
import {runValidator, userSelectionValidator} from '../validation';
import {auth} from '../firebaseadmin';

export const enableUserHandler = async (data: { uid: string }, context: CallableContext) => {
  await authorizeForRole(context, 'admin');

  runValidator(data, userSelectionValidator);

  try {
    return await auth.updateUser(data.uid, {
      disabled: false,
    });
  } catch (e) {
    firebaseAuthErrorHandling(e);
  }

  return {success: false};
}
