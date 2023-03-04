import {database} from 'firebase-functions';
import {getNewId, indexNewItem, removeIndexOfItem, removeUnknownKeys, setIntIds, updateIndexOfItem} from './common';
import {Resource} from '../types';

export const resOnCreate = database.ref(`resources/{id}`).onCreate(async (snapshot, context) => {
  await indexNewItem('resources', context.params.id, snapshot.child('name'));

  const val = snapshot.val() as Resource;
  removeUnknownKeys('resource', val);
  await setIntIds('categories', val);
  await setIntIds('counties', val);
  val.id = await getNewId('resources', context.params.id);
  val.dataValidated = true;
  await snapshot.ref.set(val);
});

export const resOnUpdate = database.ref('resources/{id}').onUpdate(async (snapshot, context) => {
  const val = snapshot.after.val() as Resource;

  if (val.dataValidated) {
    return;
  }

  await updateIndexOfItem('resources', context.params.id, snapshot);
  removeUnknownKeys('resource', val);
  await setIntIds('categories', val);
  await setIntIds('counties', val);
  val.id = snapshot.before.child('id').val()
  val.dataValidated = true;
  await snapshot.after.ref.set(val);
});

export const resOnDelete = database.ref('resources/{id}').onDelete(async (snapshot, context) => {
  await removeIndexOfItem('resources', snapshot.child('name'), context.params.id);
});
