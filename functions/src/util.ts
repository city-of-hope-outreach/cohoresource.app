import {NamedEntity, NamedEntityType, Resource, Validator} from './types';
import {db} from './firebaseadmin';
import {https} from 'firebase-functions';
import {addToList, removeFromList} from './dbutil';
import type {CallableContext} from 'firebase-functions/lib/common/providers/https';

export const wordsFromName = (name: string): string[] => {
  const normalized = name
    .replaceAll('.', '') // clear out periods in case of abbreviations
    .replaceAll(/\W+/g, ' ') // clear out all non alpha chars
    .trim()
    .toLowerCase();
  return normalized.split(' ')
    // ignore common words
    .filter(word => word.length > 2 && word !== 'the');
};

// takes arr1 and removes any elements that are not also included in arr2
// ex:
// arr1: [0, 1, 2, 3]
// arr2: [2, 3, 4, 5]
// difference(arr1, arr2): [0, 1]
// difference(arr2, arr1): [4, 5]
export const difference = <T>(arr1: T[], arr2: T[]): T[] => arr1.filter(item => !arr2.includes(item));

// object validator system
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

// get the last item in collection and return that item's id plus 1
export const getNewId = async (unit: 'categories' | 'resources'): Promise<number> => {
  // get the last object from the collection.
  const snapshot = await db.ref(unit).orderByChild('id').limitToLast(1).get();

  if (!snapshot.exists()) {
    return 0;
  }

  const lastUnitObj = (snapshot).val() as { [p: string]: { id?: number } };
  const objkeys = Object.keys(lastUnitObj);

  if (objkeys.length === 0) {
    // probably should never happen (because snapshot.exists() would have been false)
    return 0;
  }

  if (objkeys.length === 1 && lastUnitObj[objkeys[0]].id === undefined) {
    // should never happen
    throw new Error(`An item in the ${unit} collection was found without an ID.`);
  }

  return lastUnitObj[objkeys[0]].id! + 1;
};

export const indexNewItem = async <T extends NamedEntity>(entityType: NamedEntityType, id: string, name: string) => {
  // add words of the added name to the index
  const words = wordsFromName(name);
  for (const word of words) {
    await addToList(`/search/${entityType}/${word}`, id);
  }
};

export const updateIndexOfItem = async (entityType: NamedEntityType, key: string, before: string, after: string) => {
  // compare words that were added and removed
  const beforeWords = wordsFromName(before);
  const afterWords = wordsFromName(after);
  const added = difference(afterWords, beforeWords);
  const removed = difference(beforeWords, afterWords);

  for (const word of added) {
    await addToList(`/search/${entityType}/${word}`, key);
  }

  for (const word of removed) {
    await removeFromList(`/search/${entityType}/${word}`, key);
  }
};

export const removeIndexOfItem = async (entityType: NamedEntityType, name: string, oldKey: string) => {
  // delete all occurrences of the deleted key in the index
  for (const word of wordsFromName(name)) {
    await removeFromList(`/search/${entityType}/${word}`, oldKey);
  }
};

const keysArrayKey: {
  categories: 'categoryKeys',
  counties: 'countyKeys'
} = {
  categories: 'categoryKeys',
  counties: 'countyKeys',
};

export const setIntIds = async (unit: 'categories' | 'counties', obj: Resource) => {
  const keys = obj[keysArrayKey[unit]];

  if (keys === undefined) {
    return;
  }

  const ids: number[] = [];

  for (const key of keys) {
    const idSnapshot = await db.ref(`/${unit}/${key}/id`).get();
    if (!idSnapshot.exists()) {
      throw new https.HttpsError('invalid-argument', `No ${unit} matches key ${key}`);
    }
    ids.push(idSnapshot.val());
  }

  obj[unit] = ids;
};

export const addResourceToCategories = async (resourceKey: string, categoryKeys?: string[]) => {
  if (!categoryKeys) return;

  for (const categoryKey of categoryKeys) {
    await addToList(`/categories/${categoryKey}/resources`, resourceKey);
  }
};

export const updateCategoriesWithResource =
  async (resourceKey: string,
         oldCategoryKeys?: string[],
         newCategoryKeys?: string[]) => {
    const categoriesToRemove = difference(oldCategoryKeys ?? [], newCategoryKeys ?? []);
    const categoriesToAdd = difference(newCategoryKeys ?? [], oldCategoryKeys ?? []);

    for (const key of categoriesToAdd) {
      await addToList(`/categories/${key}/resources`, resourceKey);
    }

    for (const key of categoriesToRemove) {
      await removeFromList(`/categories/${key}/resources`, resourceKey);
    }
  };

export const deleteResourceFromCategories = async (resourceKey: string, categoryKeys?: string[]) => {
  for (const key of categoryKeys ?? []) {
    await removeFromList(`/categories/${key}/resources`, resourceKey);
  }
};

export const checkUserPermission = async (context: CallableContext) => {
  if (!context.auth?.uid) {
    throw new https.HttpsError('unauthenticated', 'Not authenticated');
  }

  if (!(await db.ref(`/users/${context.auth?.uid}`).get()).val()) {
    throw new https.HttpsError('permission-denied', 'Not allowed');
  }
};
