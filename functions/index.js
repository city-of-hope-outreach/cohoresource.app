const functions = require('firebase-functions');

const fulldatabase = require('./fulldatabase');
const feedback = require('./feedback');
const categoryid = require('./categoryid');

exports.fulldatabase = functions.https.onRequest(fulldatabase.handler);
exports.feedback = functions.https.onRequest(feedback.handler);
exports.categoryid = functions.https.onRequest(categoryid.expressApp);

//
// exports.categories = functions.https.onRequest((req, resp) => {
//
// });
//
// exports.counties = functions.https.onRequest((req, resp) => {
//
// });
//
// exports.resources = functions.https.onRequest((req, resp) => {
//
// });

// exports.updateIDs = functions.https.onRequest(async (req, resp) =>{
// 	const categories = admin.database().ref('/categories');
// 	const resources = admin.database().ref('/resources');
// 	var catSnapshot;
// 	var resSnapshot;
//
// 	await resources.orderByKey().once("value", (snapshot) => {
// 		resSnapshot = snapshot;
// 	});
//
// 	await categories.orderByKey().once("value", (snapshot) => {
// 		catSnapshot = snapshot;
// 	});
//
// 	resources.forEach((childSnap) => {
// 		const resCategories = childSnap.child("categories");
// 		resCategories.forEach((resCatSnap) =>{
// 			const oldID = resCatSnap.val()
//
// 		});
// 		// for each category of resource:
// 		//     get old id
// 		//     find new category id
// 		//     change value and save
// 	});
//
// 	resp.json(children);
// });
