import * as functions from 'firebase-functions';
import {db} from './firebaseadmin';
import {NamedEntity} from './types';
import {database} from 'firebase-admin';
import Reference = database.Reference;
import {wordsFromName} from './util';

type IndexMap = { [p: string]: string[] };

export const indexTitlesHandler = async (req: functions.https.Request, res: functions.Response): Promise<void> => {
  const categories = db.ref('/categories');
  const counties = db.ref('/counties');
  const resources = db.ref('/resources');

  let indexedCategoryTitles: IndexMap = {};
  let indexedCountyTitles: { [p: string]: string[] } = {};
  let indexedResourceTitles: { [p: string]: string[] } = {};

  await indexSnapshot(categories, indexedCategoryTitles);
  await db.ref('/search/categories').set(indexedCategoryTitles);

  await indexSnapshot(counties, indexedCountyTitles);
  await db.ref('/search/counties').set(indexedCountyTitles);

  await indexSnapshot(resources, indexedResourceTitles);
  await db.ref('/search/resources').set(indexedResourceTitles);

  res.status(200);
  res.json();
};

const indexSnapshot = async (dbRef: Reference, index: IndexMap) => {
  const snapshot = await dbRef.once('value');
  snapshot.forEach(childSnapshot => {
    const key = childSnapshot.key;
    if (key === null) {
      return;
    }

    const val = childSnapshot.val() as NamedEntity;
    const words = wordsFromName(val.name);
    for (const word of words) {
      if (index[word]) {
        index[word].push(key);
      } else {
        index[word] = [key];
      }
    }
  });
};
