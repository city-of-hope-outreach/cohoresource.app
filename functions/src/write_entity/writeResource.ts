import {db} from '../firebaseadmin';
import {Resource, ResourceContact, ResourceLocation, Validator} from '../types';
import {
  getNewId,
  setIntIds,
  addResourceToCategories,
  updateCategoriesWithResource,
  deleteResourceFromCategories,
  authorizeForRole
} from '../util';
import {CallableRequest} from 'firebase-functions/lib/common/providers/https';
import {https} from 'firebase-functions/v2';
import {
  runValidator, validateEmail,
  validateNonEmptyArrayOfType,
  validateNonEmptyString,
  validateNumber, validateNumberArr,
  validateStringArr
} from '../validation';
import {indexNewItem, removeIndexOfItem, updateIndexOfItem} from '../titleIndexing';

const resourceContactValidator: Validator<ResourceContact> = {
  typeInt: {
    required: true, validate: obj => {
      if (![0, 1, 2, 3].includes(obj)) {
        throw new Error('must a number between 0 and 3');
      }
    }
  },
  value: {
    required: true, validate: (obj, parent) => {
      if (typeof obj !== 'string') {
        throw new Error('must be a string');
      }

      if (parent.typeInt === 0 || parent.typeInt === 3) {
        if (!/^(1-)?\d{3}-\d{3}-\d{4}$/.test(obj)) {
          throw new Error('does not match the phone number regex');
        }
      } else if (parent.typeInt === 1) {
        validateEmail(obj);
      } else {
        if (obj.length === 0) {
          throw new Error('must not be empty');
        }
      }
    }
  },
  name: {required: false, validate: validateNonEmptyString}
};

const resourceLocationValidator: Validator<ResourceLocation> = {
  desc: {required: true, validate: validateNonEmptyString},
  street1: {required: true, validate: validateNonEmptyString},
  street2: {required: false, validate: validateNonEmptyString},
  city: {required: true, validate: validateNonEmptyString},
  state: {
    required: true, validate: obj => {
      validateNonEmptyString(obj);
      if ((obj as string).length !== 2) {
        throw new Error('must be two characters');
      }
    }
  },
  zip: {
    required: true, validate: obj => {
      if (typeof obj !== 'string') {
        throw new Error('must be a string');
      }

      if (!/^\d{5}(-\d{4})?$/.test(obj)) {
        throw new Error('does not match zip code regex');
      }
    }
  }
};

const validateContactList = (obj: any) => {
  validateNonEmptyArrayOfType(obj, 'object');
  for (const contact of (obj as ResourceContact[])) {
    runValidator(contact, resourceContactValidator);
  }
};

const validateLocationList = (obj: any) => {
  validateNonEmptyArrayOfType(obj, 'object');
  for (const loc of (obj as ResourceLocation[])) {
    runValidator(loc, resourceLocationValidator);
  }
};

const resourceValidator: Validator<Resource> = {
  id: {required: false, validate: validateNumber}, // id will be set after validation
  name: {required: true, validate: validateNonEmptyString},
  name_lower: {required: false, validate: validateNonEmptyString}, // name_lower will be set after validation
  categoryKeys: {required: false, validate: validateStringArr},
  countyKeys: {required: false, validate: validateStringArr},
  categories: {required: false, validate: validateNumberArr}, // will be set after validation
  counties: {required: false, validate: validateNumberArr}, // will be set after validation
  description: {required: false, validate: validateNonEmptyString},
  documentation: {required: false, validate: validateNonEmptyString},
  hours: {required: false, validate: validateNonEmptyString},
  services: {required: false, validate: validateNonEmptyString},
  tags: {required: false, validate: validateNonEmptyString},
  contact: {required: false, validate: validateContactList},
  locations: {required: false, validate: validateLocationList}
};

export const postResourceCallableHandler = async (request: CallableRequest) => {
  await authorizeForRole(request.auth, 'user');

  try {
    runValidator(request.data, resourceValidator);
  } catch (e) {
    throw new https.HttpsError('invalid-argument', (e as Error).message);
  }

  const resource = request.data as Resource;

  // find new id, will need rewritten function because at this point the resource has not been added yet
  resource.id = await getNewId('resources');

  // set name_lower to name.toLowerCase()
  resource.name_lower = resource.name.toLowerCase();

  // set category ids from category keys
  await setIntIds('categories', resource);

  // set county ids from county keys
  await setIntIds('counties', resource);

  // save ref, get id of new object
  const pushedResRef = await db.ref('/resources').push(resource);

  if (!pushedResRef.key) {
    throw new https.HttpsError('internal', 'No key for new resources');
  }

  // update index of title, might need to update resource
  await indexNewItem('resources', pushedResRef.key, resource.name);

  // add resource to categories
  await addResourceToCategories(pushedResRef.key, resource.categoryKeys);

  return pushedResRef.key;
};

export const putResourceCallableHandler = async (request: CallableRequest) => {
  await authorizeForRole(request.auth, 'user');

  if (!request.data.key) {
    throw new https.HttpsError('invalid-argument', 'data.key is missing');
  }

  if (typeof request.data.key !== 'string') {
    throw new https.HttpsError('invalid-argument', 'data.key must be a string');
  }

  if (!request.data.resource) {
    throw new https.HttpsError('invalid-argument', 'data.resource is missing');
  }

  const dbref = db.ref(`/resources/${request.data.key}`);
  const beforeSnapshot = await dbref.get();
  if (!beforeSnapshot.exists()) {
    throw new https.HttpsError('not-found', 'Resource not found');
  }

  try {
    runValidator(request.data.resource, resourceValidator);
  } catch (e) {
    throw new https.HttpsError('invalid-argument', (e as Error).message);
  }

  const oldResource = beforeSnapshot.val() as Resource;
  const resource = request.data.resource as Resource;

  // set id to old id
  resource.id = oldResource.id;

  // set name_lower to name.toLowerCase()
  resource.name_lower = resource.name.toLowerCase();

  // update indexing of title
  await updateIndexOfItem('resources', request.data.key, oldResource.name, resource.name);

  // set category ids from category keys
  await setIntIds('categories', resource);

  // set county ids from county keys
  await setIntIds('counties', resource);

  // add resources to categories
  await updateCategoriesWithResource(request.data.key, oldResource.categoryKeys, resource.categoryKeys);

  await dbref.set(resource);

  return resource;
};

export const deleteResourceCallablehandler = async (request: CallableRequest) => {
  await authorizeForRole(request.auth, 'user');

  if (!request.data.key) {
    throw new https.HttpsError('invalid-argument', 'data.key is missing');
  }

  if (typeof request.data.key !== 'string') {
    throw new https.HttpsError('invalid-argument', 'data.key must be a string!');
  }

  const ref = db.ref(`/resources/${request.data.key}`);
  const beforeSnapshot = await ref.get();
  if (!beforeSnapshot.exists()) {
    throw new https.HttpsError('not-found', 'Resource not found');
  }

  const resource = beforeSnapshot.val() as Resource;
  await removeIndexOfItem('resources', resource.name, request.data.key);
  await ref.remove();

  // remove resource from categories
  await deleteResourceFromCategories(request.data.key, resource.categoryKeys);

  return {status: 'ok'};
};
