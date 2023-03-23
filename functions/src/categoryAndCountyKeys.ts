import * as functions from 'firebase-functions';
import {Category} from './types';
import {db} from './firebaseadmin';

export const categoryAndCountyKeys = async (req: functions.https.Request, res: functions.Response): Promise<void> => {
  try {
    await addKeys('categories', 'categoryKeys');
    await addKeys('counties', 'countyKeys');

    res.status(200);
    res.json("ok");
  } catch (e) {
    res.status(500);
    res.json(e);
  }
};

const addKeys = async (unit: 'categories' | 'counties', childKey: 'categoryKeys' | 'countyKeys') => {
  const resources = db.ref('/resources');
  const resSnapshot = await resources.once('value');
  const categoriesSnap = await db.ref(`/${unit}`).once('value');
  const idToCatKeyMap: { [p: number]: string } = {};
  categoriesSnap.forEach(a => {
    const cat = a.val() as Category;
    if (a.key === null) {
      throw new Error('Key cannot be null');
    }
    idToCatKeyMap[cat.id] = a.key;
  });

  resSnapshot.forEach((a) => {
    const categoriesArr = a.child(unit).val() as number[] | undefined;
    const resCategoriesKeysArr: string[] = [];
    categoriesArr?.forEach(id => {
      resCategoriesKeysArr.push(idToCatKeyMap[id]);
    });
    a.child(childKey).ref.set(resCategoriesKeysArr);
  });
}
