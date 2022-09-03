import express from 'express';
import cors from 'cors';
import {db} from './firebaseadmin';

const app = express();
app.use(cors({origin: true}));

app.post('/:unit',  async (req, resp) => {
  let unit = "categories";
  let unitParam = req.params['unit'];

  if (unitParam && unitParam === 'counties') {
    unit = unitParam;
  }

  const categories = db.ref(`/${unit}`);

  let ids: number[] = [];

  await categories.orderByKey().once("value", (snapshot) => {
    snapshot.forEach((childSnap) => {
      ids.push(childSnap.val().id);
    });
  });

  ids.sort();

  let newId;

  if (ids.length > 0) {
    newId = ids[ids.length - 1] + 1;
  } else {
    newId = 0;
  }

  resp.json({data: {"id": newId, "entity": unit}});
});

export const uniqueIdApp = app;
