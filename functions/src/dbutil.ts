import {db} from './firebaseadmin';

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
