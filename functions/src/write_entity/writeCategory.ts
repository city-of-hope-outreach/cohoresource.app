import {Category, Resource, Validator} from '../types';
import {checkUserPermission, getNewId} from '../util';
import {db} from '../firebaseadmin';
import type {CallableContext} from 'firebase-functions/lib/common/providers/https';
import {https} from 'firebase-functions';
import {indexNewItem, removeFromList, removeIndexOfItem, updateIndexOfItem} from '../titleIndexing';
import {runValidator, validateNonEmptyString, validateNumber} from '../validation';

const categoryValidator: Validator<Category> = {
  id: {required: false, validate: validateNumber}, // id will be set after validation
  name: {required: true, validate: validateNonEmptyString},
  name_lower: {required: false, validate: validateNonEmptyString}, // name_lower will be set after validation
  icon: {required: true, validate: validateNonEmptyString},
  description: {required: false, validate: validateNonEmptyString},
  resources: {required: false, validate: () => false} // this value is not allowed in input because it is set from previous value
};

export const postCategoryCallableHandler = async (data: any, context: CallableContext) => {
  await checkUserPermission(context);

  try {
    runValidator(data, categoryValidator);
  } catch (e) {
    throw new https.HttpsError('invalid-argument', (e as Error).message);
  }

  const category = data as Resource;

  // find new id, will need rewritten function because at this point the resource has not been added yet
  category.id = await getNewId('categories');

  // set name_lower to name.toLowerCase()
  category.name_lower = category.name.toLowerCase();

  // save ref, get id of new object
  const pushedCatRef = await db.ref('/categories').push(category);

  if (!pushedCatRef.key) {
    throw new Error('No key for new category');
  }

  // update index of title, might need to update resource
  await indexNewItem('categories', pushedCatRef.key, category.name);

  return pushedCatRef.key;
};

export const putCategoryCallableHandler = async (data: any, context: CallableContext) => {
  await checkUserPermission(context);

  if (!data.key) {
    throw new https.HttpsError('invalid-argument', 'data.key is missing');
  }

  if (typeof data.key !== 'string') {
    throw new https.HttpsError('invalid-argument', 'data.key must be a string');
  }

  if (!data.category) {
    throw new https.HttpsError('invalid-argument', 'data.category is missing');
  }

  const dbref = db.ref(`/categories/${data.key}`);
  const beforeSnapshot = await dbref.get();
  if (!beforeSnapshot.exists()) {
    throw new https.HttpsError('not-found', 'Category not found');
  }

  try {
    runValidator(data.category, categoryValidator);
  } catch (e) {
    throw new https.HttpsError('invalid-argument', (e as Error).message);
  }

  const oldCategory = beforeSnapshot.val() as Category;
  const category = data.category as Category;

  // set id to old id
  category.id = oldCategory.id;

  // set name_lower to name.toLowerCase()
  category.name_lower = category.name.toLowerCase();

  // set category resources
  if (oldCategory.resources) {
    category.resources = oldCategory.resources;
  }

  // update indexing of title
  await updateIndexOfItem('categories', data.key, oldCategory.name, category.name);

  await dbref.set(category);

  return category;
};

export const deleteCategoryCallableHandler = async (data: any, context: CallableContext) => {
  await checkUserPermission(context);

  if (!data.key) {
    throw new https.HttpsError('invalid-argument', 'data.key is missing');
  }

  if (typeof data.key !== 'string') {
    throw new https.HttpsError('invalid-argument', 'data.key must be a string!');
  }

  const ref = db.ref(`/categories/${data.key}`);
  const beforeSnapshot = await ref.get();
  if (!beforeSnapshot.exists()) {
    throw new https.HttpsError('not-found', 'Category not found');
  }

  const oldCategory = beforeSnapshot.val();

  await removeIndexOfItem('categories', oldCategory.name, data.key);
  await ref.remove();

  // remove all occurrences of this category from resources
  for (const resourceKey of oldCategory.resources ?? []) {
    await removeFromList(`/resources/${resourceKey}/categoryKeys`, data.key);
    await removeFromList(`/resources/${resourceKey}/categories`, oldCategory.id);
  }

  return {status: 'ok'};
};
