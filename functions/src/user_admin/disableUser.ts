import {CallableRequest} from 'firebase-functions/lib/common/providers/https';
import {authorizeForRole, firebaseAuthErrorHandling} from '../util';
import {runValidator, userSelectionValidator} from '../validation';
import {auth} from '../firebaseadmin';

export const disableUserHandler = async (request: CallableRequest) => {
  await authorizeForRole(request.auth, 'admin');

  runValidator(request.data, userSelectionValidator);

  const data = request.data as { uid: string };

   try {
     const user = await auth.updateUser(data.uid, {
       disabled: true,
     });

     return {
       uid: user.uid,
       email: user.email,
       displayName: user.displayName,
       disabled: user.disabled,
       metadata: user.metadata,
       roles: user.customClaims?.roles,
     };
   } catch (e) {
     firebaseAuthErrorHandling(e);
   }

   return {success: false};
}
