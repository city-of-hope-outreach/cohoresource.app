import {database} from 'firebase-functions';
import {NamedEntityType} from './types';
import {difference, wordsFromName} from './util';
import {db} from './firebaseadmin';


export const onCreateHandlerFactory = (entityType: NamedEntityType) => {
  return database.ref(`${entityType}/{id}/name`).onCreate(async (snapshot, context) => {
    const id = context.params.id as string;
    // add words of the added name to the index
    const name = snapshot.val() as string;
    const words = wordsFromName(name);
    for (const word of words) {
      await addKeyForWord(entityType, word, id);
    }
  });
};

export const onDeleteHandlerFactory = (entityType: NamedEntityType) => {
  return database.ref(`${entityType}/{id}/name`).onDelete(async (snapshot, context) => {
    // delete all occurrences of the deleted key in the index
    const oldName = snapshot.val() as string;
    const oldKey = context.params.id;
    for (const word of wordsFromName(oldName)) {
      await removeKeyForWord(entityType, word, oldKey);
    }
  });
};

export const onUpdateHandlerFactory = (entityType: NamedEntityType) => {
  return database.ref(`${entityType}/{id}/name`).onUpdate(async (change, context) => {
    // compare words that were added and removed
    const key = context.params.id;
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
  });
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
  const wordIdxVal = (await wordIdxRef.once('value')).val() as string[] | undefined;
  if (wordIdxVal && wordIdxVal.includes(key)) {
    if (wordIdxVal.length === 1) {
      // remove the word from the index because it was the last key
      await wordIdxRef.remove();
    } else {
      await wordIdxRef.set(wordIdxVal.splice(wordIdxVal.indexOf(key), 1));
    }
  }
};
