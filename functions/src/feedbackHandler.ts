import * as functions from 'firebase-functions';
import {db} from './firebaseadmin';

export const feedbackHandler = async (req: functions.https.Request, res: functions.Response): Promise<void> => {
  const feedbackRef = db.ref('/feedback');
  const validationRef = db.ref("/feedbackvalidation");
  const apikey = req.body.apikey;
  const secret = req.body.secret;
  const type = req.body.type;
  const resource = req.body.resource;
  const comments = req.body.comments;

  if (apikey && secret && type && resource && comments) {
    // console.log("key: ", apikey, ", secret: ", secret, ", type: ", type, ", resource: ", resource, ", comments: ", comments);
    let actualkey;
    let actualsecret;

    await validationRef.once("value", (snapshot) => {
      actualkey = snapshot.child("apikey").val();
      actualsecret = snapshot.child("secret").val();
    });

    if (apikey == actualkey && secret == actualsecret) {
      feedbackRef.push({"type": type, "resource":resource, "comments":comments});
      res.send("Feedback posted");
    } else {
      res.send("Invalid API key and secret");
    }
  } else {
    res.send("Invalid Params");
    return;
  }

  res.send(req.rawBody);
};
