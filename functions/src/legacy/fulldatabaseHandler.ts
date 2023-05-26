import * as functions from "firebase-functions";
import {db} from '../firebaseadmin';
import {database} from 'firebase-admin';

export const fulldatabaseHandler = async (req: functions.https.Request, res: functions.Response): Promise<void> => {
  const categories = db.ref('/categories');
  const counties = db.ref('/counties');
  const resources = db.ref('/resources');
  let catSnapshot: database.DataSnapshot;
  let countySnapshot: database.DataSnapshot;
  let resSnapshot: database.DataSnapshot;

  let resourcesList: Object[] = [];

  await resources.orderByKey().once("value", (snapshot) => {
    resSnapshot = snapshot;
    resSnapshot.forEach((childSnap) => {
      resourcesList.push(childSnap.toJSON()!);
    });
  });

  let categoryList: Object[] = [];

  await categories.orderByKey().once("value", (snapshot) => {
    catSnapshot = snapshot;
    catSnapshot.forEach((childSnap) => {
      categoryList.push(childSnap.toJSON()!);
    });
  });

  let countyList: Object[] = [];

  await counties.orderByKey().once("value", (snapshot) => {
    countySnapshot = snapshot;
    countySnapshot.forEach((childSnap) => {
      countyList.push(childSnap.toJSON()!);
    });
  });

  res.json({"resources": resourcesList, "counties": countyList, "categories": categoryList});
}
