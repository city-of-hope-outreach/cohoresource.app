import {difference, wordsFromName} from '../util';
import {database} from 'firebase-admin';
import {Category, NamedEntityType, Resource} from '../types';
import {db} from '../firebaseadmin';
import {Change} from 'firebase-functions';

export const indexNewItem = async (entityType: NamedEntityType, id: string, snapshot: database.DataSnapshot) => {
  // add words of the added name to the index
  const name = snapshot.val() as string;
  const words = wordsFromName(name);
  for (const word of words) {
    await addKeyForWord(entityType, word, id);
  }
};

export const removeIndexOfItem = async (entityType: NamedEntityType, snapshot: database.DataSnapshot, oldKey: string) => {
  // delete all occurrences of the deleted key in the index
  const oldName = snapshot.val() as string;
  for (const word of wordsFromName(oldName)) {
    await removeKeyForWord(entityType, word, oldKey);
  }
};

export const updateIndexOfItem = async (entityType: NamedEntityType, key: string, change: Change<database.DataSnapshot>) => {
  // compare words that were added and removed
  const before = change.before.child('name').val() as string;
  const after = change.after.child('name').val() as string;
  const beforeWords = wordsFromName(before);
  const afterWords = wordsFromName(after);
  const added = difference(afterWords, beforeWords);
  const removed = difference(beforeWords, afterWords);

  for (const word of added) {
    await addKeyForWord(entityType, word, key);
  }

  for (const word of removed) {
    await removeKeyForWord(entityType, word, key);
  }
};

const addKeyForWord = async (entityType: NamedEntityType, word: string, key: string) => {
  const wordIdxRef = db.ref(`/search/${entityType}/${word}`);
  const wordIdxSnapshot = await wordIdxRef.once('value');
  const wordIdxVal = wordIdxSnapshot.val() as string[] | undefined;
  if (wordIdxVal) {
    // the word is already in the index, just gotta add the new key to the list
    wordIdxVal.push(key);
    await wordIdxRef.set(wordIdxVal);
  } else {
    // first time seeing this word!
    await wordIdxRef.set([key]);
  }
};

const removeKeyForWord = async (entityType: NamedEntityType, word: string, key: string) => {
  const wordIdxRef = db.ref(`/search/${entityType}/${word}`);
  const wordIdxVal = (await wordIdxRef.get()).val() as string[] | null;
  if (wordIdxVal && wordIdxVal.includes(key)) {
    if (wordIdxVal.length === 1) {
      // remove the word from the index because it was the last key
      await wordIdxRef.remove();
    } else {
      wordIdxVal.splice(wordIdxVal.indexOf(key), 1);
      await wordIdxRef.set(wordIdxVal);
    }
  }
};

const categoryKeys: Array<keyof Category> = [
  'id',
  'name',
  'name_lower',
  'description',
];

const resourceKeys: Array<keyof Resource> = [
  'id',
  'name',
  'name_lower',
  'description',
  'categories',
  'categoryKeys',
  'contact',
  'counties',
  'countyKeys',
  'documentation',
  'hours',
  'locations',
  'services',
  'tags'
];

export const removeUnknownKeys = (unitType: 'resource' | 'category', obj: any) => {
  let requiredKeys: string[] = unitType === 'resource' ? resourceKeys : categoryKeys;

  let objkeys = Object.keys(obj);

  for (const key of objkeys) {
    if (!requiredKeys.includes(key)) {
      delete obj[key];
      console.warn(`Removed erroneous key '${key}' from ${unitType} ${obj.name}`);
    }
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
    ids.push(idSnapshot.val());
  }

  obj[unit] = ids;
};

export const getNewId = async (unit: 'categories' | 'resources', newItemKey: string): Promise<number> => {
  // get the last two objects from the collection.
  // if an object doesn't have a value set for the child, it is put at the end of the order, so the newly added item
  // will show up last. so we need the second to last object in the query
  const lastUnitObj = (await db.ref(unit).orderByChild('id').limitToLast(2).get()).val() as { [p: string]: { id?: number } };
  const objkeys = Object.keys(lastUnitObj);

  // we still may end up less than two objects, so we need to deal with that.
  // if there's one item in the result, it's because the newly created object was the first object (collection was empty
  // before).
  if (
    objkeys.length === 0 || // should never happen
    (objkeys.length === 1 && lastUnitObj[objkeys[0]].id === undefined) // will only happen if collection is empty in first place
  ) {
    return 0;
  }

  // also should never happen
  if (objkeys.length === 1) {
    return lastUnitObj[objkeys[0]].id! + 1;
  }

  // if for some reason lastUnitObj does not contain newItemKey, get max of two objects and add one
  if (!objkeys.includes(newItemKey)) {
    return Math.max(lastUnitObj[objkeys[0]].id ?? 0, lastUnitObj[objkeys[1]].id ?? 0) + 1;
  }

  // otherwise, get object that is not the newly added object and add one
  if (objkeys[0] === newItemKey) {
    return (lastUnitObj[objkeys[1]].id ?? 0) + 1;
  }

  return (lastUnitObj[objkeys[0]].id ?? 0) + 1;
};
