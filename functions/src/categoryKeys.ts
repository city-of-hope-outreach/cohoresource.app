import * as functions from 'firebase-functions';
import {Category} from './types';
import {db} from './firebaseadmin';

const categoryKeys = async (req: functions.https.Request, res: functions.Response): Promise<void> => {
  try {
    const resources = db.ref('/resources');
    const resSnapshot = await resources.once('value');
    const categoriesSnap = await db.ref('/categories').once('value');
    const idToCatKeyMap: { [p: number]: string } = {};
    categoriesSnap.forEach(a => {
      const cat = a.val() as Category;
      if (a.key === null) {
        res.status(500);
        res.json({msg: 'Key for category is null'});
        throw new Error('Key cannot be null');
      }
      idToCatKeyMap[cat.id] = a.key;
    });

    resSnapshot.forEach((a) => {
      const categoriesArr = a.child('categories').val() as number[] | undefined;
      const resCategoriesKeysArr: string[] = [];
      categoriesArr?.forEach(id => {
        resCategoriesKeysArr.push(idToCatKeyMap[id]);
      });
      a.child('categoryKeys').ref.set(resCategoriesKeysArr);
    });

    res.status(200);
    res.json("ok");
  } catch (e) {
    res.status(500);
    res.json(e);
  }
};

export default categoryKeys;
