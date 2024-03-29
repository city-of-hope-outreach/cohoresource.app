import * as functions from "firebase-functions";
import {fulldatabaseHandler} from './fulldatabaseHandler';
import {feedbackHandler} from './feedbackHandler';
import {uniqueIdApp} from './uniqueidHandler';


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
