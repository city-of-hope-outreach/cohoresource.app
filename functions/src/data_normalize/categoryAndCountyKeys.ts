import {Category} from '../types';
import {db} from '../firebaseadmin';
import {CallableContext} from 'firebase-functions/lib/common/providers/https';
import {authorizeForRole} from '../util';

export const categoryAndCountyKeys = async (_: any, context: CallableContext) => {
  await authorizeForRole(context, 'admin');

  await addKeys('categories', 'categoryKeys');
  await addKeys('counties', 'countyKeys');

  return {status: 'ok'};
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
};
