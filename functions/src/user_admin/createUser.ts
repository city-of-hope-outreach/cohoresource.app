import {CallableContext} from 'firebase-functions/lib/common/providers/https';
import {authorizeForRole, generateStarterPassword} from '../util';
import {UserRole, Validator} from '../types';
import {runValidator, validateEmail, validateNonEmptyString, validateStringArr} from '../validation';
import {auth} from '../firebaseadmin';
import sendgrid from '@sendgrid/mail';
import apiKey from '../sendgridkey.json';
import type {UserRecord} from 'firebase-admin/lib/auth';
import {https} from 'firebase-functions';

type NewUser = {
  email: string;
  displayName: string;
  roles: UserRole[];
}

const newUserValidator: Validator<NewUser> = {
  email: {required: true, validate: validateEmail},
  displayName: {required: true, validate: validateNonEmptyString},
  roles: {
    required: true, validate: (obj => {
      validateStringArr(obj);
      const roles = ['user', 'admin'];
      const filtered = (obj as string[]).filter(s => !roles.includes(s));
      if (filtered.length !== 0) {
        throw Error(`must be array with following strings: ${roles.join(', ')}`);
      }
    })
  }
};

export const createUserHandler = async (data: NewUser, context: CallableContext) => {
  await authorizeForRole(context, 'admin');

  try {
    runValidator(data, newUserValidator);
  } catch (e) {
    throw new https.HttpsError('invalid-argument', (e as Error).message);
  }

  // generate a password
  const startPw = generateStarterPassword();
  let user: UserRecord;

  try {
    // create the user
    user = await auth.createUser({
      displayName: data.displayName,
      email: data.email,
      password: startPw,
    });

    // add claims
    await auth.setCustomUserClaims(user.uid, {roles: data.roles});

    // generate password reset link
    const resetLink = await auth.generatePasswordResetLink(data.email);

    sendgrid.setApiKey(apiKey.key);
    await sendgrid.send({
      to: data.email,
      from: 'no-reply@cohoresource.app',
      subject: 'Set up your CoHO Resource App editor account',
      text: `An administrator for the CoHO Resource App has set up an account for you. Please set up your account with the following link:

${resetLink}`,
      html: `<p>An administrator for the CoHO Resource App has set up an account for you. Please set up your account with the following link:</p><p><a href="${resetLink}">${resetLink}</a></p>`
    });

    return {success: true};
  } catch (e) {
    const firebaseError = e as {message?: string, code?: string};
    if (firebaseError.code) {
      if (firebaseError.code === 'auth/email-already-exists') {
        throw new https.HttpsError('already-exists', 'A user with that email already exists!');
      } else {
        throw new https.HttpsError('internal', `Auth error: ${firebaseError.code}. ${firebaseError.message}`);
      }
    } else if (firebaseError.message) {
      throw new https.HttpsError('internal', `Unknown auth error: ${firebaseError.message}`);
    }
    throw new https.HttpsError('internal', `Unknown auth error: ${e}`);
  }
};
