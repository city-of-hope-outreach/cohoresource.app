import * as functions from 'firebase-functions';
import {db} from './firebaseadmin';
import {Category, County, Resource} from './types';

const generateLowerCaseNames = async (req: functions.https.Request, res: functions.Response): Promise<void> => {
  const categories = db.ref('/categories');
  const counties = db.ref('/counties');
  const resources = db.ref('/resources');

  const catSnapshot = await categories.once('value');
  catSnapshot.forEach((a) => {
    const obj = a.val() as Category;
    obj.name_lower = obj.name.toLowerCase();
    a.ref.set(obj)
  });

  const resSnapshot = await resources.once('value');
  resSnapshot.forEach((a) => {
    const obj = a.val() as Resource;
    obj.name_lower = obj.name.toLowerCase();
    a.ref.set(obj)
  });

  const countySnapshot = await counties.once('value');
  countySnapshot.forEach((a) => {
    const obj = a.val() as County;
    obj.name_lower = obj.name.toLowerCase();
    a.ref.set(obj)
  });

  res.status(200);
  res.json("ok");
}

export default generateLowerCaseNames;
