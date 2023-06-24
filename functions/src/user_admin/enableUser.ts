import {CallableContext} from 'firebase-functions/lib/common/providers/https';
import {authorizeForRole, firebaseAuthErrorHandling} from '../util';
import {runValidator, userSelectionValidator} from '../validation';
import {auth} from '../firebaseadmin';

export const enableUserHandler = async (data: { uid: string }, context: CallableContext) => {
  await authorizeForRole(context, 'admin');

  runValidator(data, userSelectionValidator);

  try {
    const user = await auth.updateUser(data.uid, {
      disabled: false,
    })

    return user;
  } catch (e) {
    firebaseAuthErrorHandling(e);
  }

  return {success: false};
}
