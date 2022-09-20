import * as functions from "firebase-functions";
import {fulldatabaseHandler} from './fulldatabaseHandler';
import {feedbackHandler} from './feedbackHandler';
import {uniqueIdApp} from './uniqueidHandler';
import {searchHandler} from './searchHandler';
// import {indexTitlesHandler} from './indexTitles';


// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

export const fulldatabase = functions.https.onRequest(fulldatabaseHandler);
export const feedback = functions.https.onRequest(feedbackHandler);
export const uniqueid = functions.https.onRequest(uniqueIdApp);
export const search = functions.https.onRequest(searchHandler);
// export const titleindex = functions.https.onRequest(indexTitlesHandler);
