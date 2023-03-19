import {db} from './firebaseadmin';
import {database} from 'firebase-admin';
import Reference = database.Reference;
import {checkUserPermission, wordsFromName} from './util';
import {NamedEntity, NamedEntityType} from './types';
import type {CallableContext} from 'firebase-functions/lib/common/providers/https';
import {https} from 'firebase-functions';

type NamedEntityMap = { [p: string]: Pick<NamedEntity, 'name' | 'description'> };
type SearchResult = {
  key: string;
  name: string;
  description: string;
  rank: number;
};

export const searchHandlerFactory = (unit: NamedEntityType) => {
  return async (data: any, context: CallableContext) => {
    await checkUserPermission(context);

    if (typeof data !== 'string') {
      throw new https.HttpsError('invalid-argument', `Type of req.body.data: ${typeof data}`);
    }

    if (data.length === 0) {
      throw new https.HttpsError('invalid-argument', 'Search query must be a nonempty string');
    }

    const ref = db.ref(`/search/${unit}`);
    const categoryNames: NamedEntityMap = {};
    const words = wordsFromName(data);

    // grab first three words of the search query in order to improve performance and limit search results
    for (const word of words.slice(0, 3)) {
      await getCategoryNamesForWord(unit, ref, word, categoryNames);
    }

    return rankedResults(categoryNames, words);
  }
}

const getCategoryNamesForWord = async (unit: string, ref: Reference, word: string, categoryNames: NamedEntityMap) => {
  const snapshot = await ref.orderByKey().startAt(word).endAt(`${word}\uf8ff`).limitToFirst(3).once('value');
  const snapshotVal = snapshot.val() as { [p: string]: string[] };

  for (const searchKey in snapshotVal) {
    for (const categoryKey of snapshotVal[searchKey]) {
      const itemSnapshot = await db.ref(`/${unit}/${categoryKey}`).once('value');
      const item = itemSnapshot.val() as NamedEntity;
      categoryNames[categoryKey] = {
        name: item.name,
        description: item.description
      };
    }
  }
};

const rankedResults = (categoryNames: NamedEntityMap, searchWords: string[]): SearchResult[] => {
  const keysAndNames: SearchResult[] = [];

  for (const key in categoryNames) {
    if (categoryNames.hasOwnProperty(key)) {
      keysAndNames.push({
        key,
        ...categoryNames[key],
        rank: rankOfName(searchWords, categoryNames[key].name)
      });
    }
  }

  keysAndNames.sort((item1, item2) => {
    if (item1.rank < item2.rank) return 1;
    if (item1.rank > item2.rank) return -1;
    return 0;
  });

  return keysAndNames;
};

const rankOfName = (searchWords: string[], name: string) => {
  const thisItemsWords = wordsFromName(name);
  let modifier = 1;

  if (thisItemsWords[0].startsWith(searchWords[0])) {
    modifier = 2;
  }

  let matches = 0;
  for (const searchWord of searchWords) {
    for (const thisItemsWord of thisItemsWords) {
      if (searchWord === thisItemsWord) {
        matches++;
      } else if (thisItemsWord.startsWith(searchWord)) {
        matches += searchWord.length / thisItemsWord.length;
      }
    }
  }
  return (matches / searchWords.length) * (matches / thisItemsWords.length) * modifier;
};
