import {database} from 'firebase-functions';
import {getNewId, indexNewItem, removeIndexOfItem, removeUnknownKeys, updateIndexOfItem} from './common';
import {Category, Resource} from '../types';
import {db} from '../firebaseadmin';

export const catOnCreate = database.ref('categories/{id}').onCreate(async (snapshot, context) => {
  await indexNewItem('categories', context.params.id, snapshot.child('name'));

  const val = snapshot.val() as Category;
  removeUnknownKeys('category', val);
  val.id = await getNewId('categories', context.params.id);
  val.dataValidated = true;
  await snapshot.ref.set(val);
})

export const catOnUpdate = database.ref('categories/{id}').onUpdate(async (snapshot, context) => {
  const val = snapshot.after.val() as Category;
  if (val.dataValidated) {
    return;
  }
  await updateIndexOfItem('categories', context.params.id, snapshot);
  removeUnknownKeys('category', val);
  val.id = snapshot.before.child('id').val();
  val.dataValidated = true;
  await snapshot.after.ref.set(val);
});

export const catOnDelete = database.ref(`categories/{id}`).onDelete(async (snapshot, context) => {
  await removeIndexOfItem('categories', snapshot.child('name'), context.params.id);

  const oldId = snapshot.child('id').val() as number;
  const oldKey = context.params.id;
  const resources = await db.ref('resources').get();
  resources.forEach(child => {
    const childVal = child.val() as Resource;
    let didUpdate = false;
    const keysIdx = childVal.categoryKeys?.indexOf(oldKey);
    if (keysIdx !== undefined && keysIdx !== -1) {
      childVal.categoryKeys!.splice(keysIdx, 1);
      didUpdate = true;
    }

    const idIdx = childVal.categories?.indexOf(oldId);
    if (idIdx !== undefined && idIdx !== -1) {
      childVal.categories!.splice(idIdx, 1);
      didUpdate = true;
    }

    if (didUpdate) {
      child.ref.set(childVal);
    }
  });
});
