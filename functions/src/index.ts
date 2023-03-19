import * as functions from 'firebase-functions';
import {fulldatabaseHandler} from './fulldatabaseHandler';
import {feedbackHandler} from './feedbackHandler';
import {uniqueIdApp} from './uniqueidHandler';
import {searchHandlerFactory} from './searchHandler';
import generateLowerCaseNamesHandler from './generateLowerCaseNames';
import {indexTitlesHandler} from './indexTitles';
import categoryKeysHandler from './categoryKeys';
import {deleteResourceCallablehandler, postResourceCallableHandler, putResourceCallableHandler} from './writeResource';
import {deleteCategoryCallableHandler, postCategoryCallableHandler, putCategoryCallableHandler} from './writeCategory';
import {indexCategoriesCallable} from './indexCategories';

export const fulldatabase = functions.https.onRequest(fulldatabaseHandler);
export const feedback = functions.https.onRequest(feedbackHandler);
export const uniqueid = functions.https.onRequest(uniqueIdApp);
export const searchCategories = functions.https.onCall(searchHandlerFactory('categories'));
export const searchResources = functions.https.onCall(searchHandlerFactory('resources'));
export const generateLowerCaseNames = functions.https.onRequest(generateLowerCaseNamesHandler);
export const postResource = functions.https.onCall(postResourceCallableHandler);
export const putResource = functions.https.onCall(putResourceCallableHandler);
export const deleteResource = functions.https.onCall(deleteResourceCallablehandler);
export const postCategory = functions.https.onCall(postCategoryCallableHandler);
export const putCategory = functions.https.onCall(putCategoryCallableHandler);
export const deleteCategory = functions.https.onCall(deleteCategoryCallableHandler);
export const titleindex = functions.https.onRequest(indexTitlesHandler);
export const categoryKeys = functions.https.onRequest(categoryKeysHandler);
export const indexCategories = functions.https.onCall(indexCategoriesCallable);
