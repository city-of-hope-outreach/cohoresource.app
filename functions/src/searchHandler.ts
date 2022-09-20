import {db} from './firebaseadmin';
import express from 'express';
import cors from 'cors';
import {database} from 'firebase-admin';
import Reference = database.Reference;
import {wordsFromName} from './util';

const app = express();
app.use(cors({origin: true}));

type StringMap = { [p: string]: string };

app.get('/:unit', async (req, res) => {
  let unit = req.params['unit'];

  if (unit !== 'categories' && unit !== 'counties' && unit !== 'resources') {
    res.status(404);
    res.json({
      error: 'Unit not found',
    });
  }

  if (typeof req.query.q !== 'string') {
    res.status(400);
    res.json({error: `Type of req.query.q: ${typeof req.query.q}`});
    return;
  }

  const q = req.query.q as string;

  const ref = db.ref(`/search/${unit}`);
  const categoryNames: StringMap = {};
  const words = wordsFromName(q);

  for (const word of words) {
    await getCategoryNamesForWord(unit, ref, word, categoryNames);
  }


  res.status(200);
  res.json(categoryNames);
});

const getCategoryNamesForWord = async (unit: string, ref: Reference, word: string, categoryNames: StringMap) => {
  const snapshot = await ref.orderByKey().startAt(word).endAt(`${word}\uf8ff`).once('value');
  const snapshotVal = snapshot.val() as { [p: string]: string[] };

  for (const searchKey in snapshotVal) {
    for (const categoryKey of snapshotVal[searchKey]) {
      const itemSnapshot = await db.ref(`/${unit}/${categoryKey}/name`).once('value');
      categoryNames[categoryKey] = itemSnapshot.val();
    }
  }
};

export const searchHandler = app;
