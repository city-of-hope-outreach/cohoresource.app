// object validator system
import {UpdateUser, User, Validator} from './types';

export const validateEmail = (obj: any) => {
  validateNonEmptyString(obj);
  if (!/^.+@.+\..+$/.test(obj)) {
    throw new Error('must be an email format (xxx@xxx.xxx)');
  }
};

export const validateNonEmptyString = (obj: any) => {
  if (typeof obj !== 'string' || obj.length === 0) {
    throw new Error('must be nonempty string');
  }
};

export const validateNonEmptyArrayOfType = (obj: any, type: 'string' | 'number' | 'bigint' | 'boolean' | 'object') => {
  // check that obj isn't null or undefined (or other nullish values)
  if (!obj) throw new Error('cannot be nullish');

  // check if object is array
  if (!Array.isArray(obj)) throw new Error('is not an array');

  // check that array is non empty
  if ((obj as Array<any>).length === 0) throw new Error('must not be empty');

  // check that every element in array equals given type
  for (const item of (obj as Array<any>)) {
    if (typeof item !== type) throw new Error(`array not of type ${type}`);
  }
};

export const validateNumber = (obj: any) => {
  if (typeof obj !== 'number') throw new Error('must be a number');
};

export const validateStringArr = (obj: any) => validateNonEmptyArrayOfType(obj, 'string');

export const validateNumberArr = (obj: any) => validateNonEmptyArrayOfType(obj, 'number');

// Checks a passed object through the given validator. If every key on the given object passes the validator, this
// method will return true. False if the passed in value is not an object, null, undefined, or fails the validation.
export const runValidator = <T>(obj: any, validator: Validator<T>) => {
  if (!obj) {
    throw new Error(`nullish: ${obj}`);
  }

  if (typeof obj !== 'object') {
    throw new Error(`cannot be scalar" ${obj}`);
  }

  const objKeys = Object.keys(obj);

  for (const key of objKeys) {
    // if whitespace, empty, or undefined, normalize to null
    if (obj[key] === undefined ||
      (Array.isArray(obj[key]) && obj[key].length === 0) ||
      (typeof obj[key] === 'string' && obj[key].trim().length === 0)) {
      obj[key] = null;
    }
  }

  // validate all accepted keys
  for (const key of Object.keys(validator)) {
    const keyValidator = validator[key as keyof Validator<T>];

    objKeys.splice(objKeys.indexOf(key, 1)); // remove this key from objKeys

    if (obj[key] === null || obj[key] === undefined) {
      if (keyValidator.required) throw new Error(`required key not present: ${key}`);

      continue; // don't run validator check if not required and it is not set
    }

    try {
      keyValidator.validate(obj[key], obj);
    } catch (e) {
      let msg: string;
      if (e instanceof Error) {
        msg = e.message;
      } else {
        msg = `${e}`;
      }
      throw new Error(`Validation failed for key '${key}': ${msg}`);
    }
  }

  // if there are any keys left in objKeys, they are not recognized, failing validation
  if (objKeys.length > 0) throw new Error(`Unrecognized keys: ${objKeys}`);
};

export const validateUserRoles = (obj: any) => {
  validateStringArr(obj);
  const roles = ['user', 'admin'];
  const filtered = (obj as string[]).filter(s => !roles.includes(s));
  if (filtered.length !== 0) {
    throw Error(`must be array with following strings: ${roles.join(', ')}`);
  }
};

export const userValidator: Validator<User> = {
  email: {required: true, validate: validateEmail},
  displayName: {required: true, validate: validateNonEmptyString},
  roles: {required: true, validate: validateUserRoles},
};

export const updateUserValidator: Validator<UpdateUser> = {
  ...userValidator,
  uid: {required: true, validate: validateNonEmptyString},
};
