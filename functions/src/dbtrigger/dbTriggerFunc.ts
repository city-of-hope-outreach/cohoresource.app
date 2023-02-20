import {database} from 'firebase-functions';
import {NamedEntityType} from '../types';
import {indexNewItem, removeIndexOfItem, updateIndexOfItem} from './common';


export const onCreateHandlerFactory = (entityType: NamedEntityType) => {
  return database.ref(`${entityType}/{id}/name`).onCreate(async (snapshot, context) => {
    await indexNewItem(entityType, context.params.id, snapshot);
  });
};

export const onDeleteHandlerFactory = (entityType: NamedEntityType) => {
  return database.ref(`${entityType}/{id}/name`).onDelete(async (snapshot, context) => {
    await removeIndexOfItem(entityType, snapshot, context.params.id);
  });
};

export const onUpdateHandlerFactory = (entityType: NamedEntityType) => {
  return database.ref(`${entityType}/{id}/name`).onUpdate(async (change, context) => {
    await updateIndexOfItem(entityType, context.params.id, change);
  });
};


