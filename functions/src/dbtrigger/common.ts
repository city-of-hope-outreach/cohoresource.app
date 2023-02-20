import {difference, wordsFromName} from '../util';
import {database} from 'firebase-admin';
import {NamedEntityType} from '../types';
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
  const before = change.before.val() as string;
  const after = change.after.val() as string;
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
