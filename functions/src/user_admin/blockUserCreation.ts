import {https, identity} from 'firebase-functions/v2';

export const blockUserCreation = identity.beforeUserCreated(() => {
  throw new https.HttpsError('permission-denied', 'You are not allowed to sign up.');
});
