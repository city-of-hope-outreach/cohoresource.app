import * as functions from 'firebase-functions';
import {fulldatabaseHandler} from './legacy/fulldatabaseHandler';
import {feedbackHandler} from './legacy/feedbackHandler';
import {uniqueIdApp} from './legacy/uniqueidHandler';
import {searchHandlerFactory} from './searchHandler';
import generateLowerCaseNamesHandler from './data_normalize/generateLowerCaseNames';
import {indexTitlesHandler} from './data_normalize/indexTitles';
import {
  deleteResourceCallablehandler,
  postResourceCallableHandler,
  putResourceCallableHandler
} from './write_entity/writeResource';
import {
  deleteCategoryCallableHandler,
  postCategoryCallableHandler,
  putCategoryCallableHandler
} from './write_entity/writeCategory';
import {indexCategoriesCallable} from './data_normalize/indexCategories';
import {categoryAndCountyKeys} from './data_normalize/categoryAndCountyKeys';
import {listUsersHandler} from './user_admin/listUsers';
import {createUserHandler} from './user_admin/createUser';
import {updateUserHandler} from './user_admin/updateUser';
import {deleteUserHandler} from './user_admin/deleteUser';
import {disableUserHandler} from './user_admin/disableUser';
import {enableUserHandler} from './user_admin/enableUser';

export const fulldatabase = functions.https.onRequest(fulldatabaseHandler);
export const feedback = functions.https.onRequest(feedbackHandler);
export const uniqueid = functions.https.onRequest(uniqueIdApp);
export const searchCategories = functions.https.onCall(searchHandlerFactory('categories'));
export const searchResources = functions.https.onCall(searchHandlerFactory('resources'));
export const postResource = functions.https.onCall(postResourceCallableHandler);
export const putResource = functions.https.onCall(putResourceCallableHandler);
export const deleteResource = functions.https.onCall(deleteResourceCallablehandler);
export const postCategory = functions.https.onCall(postCategoryCallableHandler);
export const putCategory = functions.https.onCall(putCategoryCallableHandler);
export const deleteCategory = functions.https.onCall(deleteCategoryCallableHandler);
export const listUsers = functions.https.onCall(listUsersHandler);
export const createUser = functions.https.onCall(createUserHandler);
export const updateUser = functions.https.onCall(updateUserHandler);
export const deleteUser = functions.https.onCall(deleteUserHandler);
export const disableUser = functions.https.onCall(disableUserHandler);
export const enableUser = functions.https.onCall(enableUserHandler);
export const generateLowerCaseNames = functions.https.onCall(generateLowerCaseNamesHandler);
export const titleindex = functions.https.onCall(indexTitlesHandler);
export const indexCategories = functions.https.onCall(indexCategoriesCallable);
export const addKeys = functions.https.onCall(categoryAndCountyKeys);
