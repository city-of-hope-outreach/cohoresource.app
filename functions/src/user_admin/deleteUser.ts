import type {CallableRequest} from 'firebase-functions/lib/common/providers/https';
import {authorizeForRole, firebaseAuthErrorHandling} from '../util';
import {runValidator, userSelectionValidator} from '../validation';
import {auth} from '../firebaseadmin';


export const deleteUserHandler = async (request: CallableRequest) => {
  await authorizeForRole(request.auth, 'admin');

  runValidator(request.data, userSelectionValidator);

  const data = request.data as { uid: string };

  try {
    await auth.deleteUser(data.uid);
    return {success: true};
  } catch (e) {
    firebaseAuthErrorHandling(e);
  }

  return {success: false};
};
