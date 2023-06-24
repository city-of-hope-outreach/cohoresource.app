import type {Resource, UserRole} from './types';
import {auth, db} from './firebaseadmin';
import {https} from 'firebase-functions';
import {addToList, removeFromList} from './titleIndexing';
import type {CallableContext} from 'firebase-functions/lib/common/providers/https';
import {randomInt} from 'crypto';

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

const keysArrayKey: {
  categories: 'categoryKeys',
  counties: 'countyKeys'
} = {
  categories: 'categoryKeys',
  counties: 'countyKeys',
};

export const setIntIds = async (unit: 'categories' | 'counties', obj: Resource) => {
  const keys = obj[keysArrayKey[unit]];

  if (!keys) {
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

export const authorizeForRole = async (context: CallableContext, role: UserRole) => {
  if (!context.auth?.uid) {
    throw new https.HttpsError('unauthenticated', 'Not authenticated');
  }

  const user = await auth.getUser(context.auth.uid);

  if (!user.customClaims?.roles || !(user.customClaims.roles as UserRole[]).includes(role)) {
    throw new https.HttpsError('permission-denied', 'Not allowed');
  }
};

export const generateStarterPassword = () => {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789-_!?.$&*"
  let pw = '';
  for (let i = 0; i < 15; i++) {
    pw += chars.charAt(randomInt(chars.length));
  }
  return pw;
}

export const firebaseAuthErrorHandling = (e: unknown) => {
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
