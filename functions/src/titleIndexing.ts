import {db} from './firebaseadmin';
import type {NamedEntity, NamedEntityType} from './types';
import {difference, wordsFromName} from './util';

export const addToList = async <T>(listPath: string, item: T) => {
  const wordIdxRef = db.ref(listPath);
  const wordIdxSnapshot = await wordIdxRef.once('value');
  const wordIdxVal = wordIdxSnapshot.val() as T[] | null;
  if (wordIdxVal) {
    // the item is already in the index, just gotta add the new key to the list
    wordIdxVal.push(item);
    await wordIdxRef.set(wordIdxVal);
  } else {
    // first time seeing this item!
    await wordIdxRef.set([item]);
  }
}

export const removeFromList = async <T>(listPath: string, item: T) => {
  const wordIdxRef = db.ref(listPath);
  const wordIdxVal = (await wordIdxRef.get()).val() as T[] | null;
  if (wordIdxVal && wordIdxVal.includes(item)) {
    if (wordIdxVal.length === 1) {
      // remove the word from the index because it was the last key
      await wordIdxRef.remove();
    } else {
      wordIdxVal.splice(wordIdxVal.indexOf(item), 1);
      await wordIdxRef.set(wordIdxVal);
    }
  }
}

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
