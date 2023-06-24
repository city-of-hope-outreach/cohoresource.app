import {CallableContext} from 'firebase-functions/lib/common/providers/https';
import {authorizeForRole, firebaseAuthErrorHandling} from '../util';
import {runValidator, userSelectionValidator} from '../validation';
import {auth} from '../firebaseadmin';



export const deleteUserHandler = async (data: { uid: string }, context: CallableContext) => {
  await authorizeForRole(context, 'admin');

  runValidator(data, userSelectionValidator);

  try {
    await auth.deleteUser(data.uid);
    return {success: true};
  } catch (e) {
    firebaseAuthErrorHandling(e);
  }

  return {success: false};
};
