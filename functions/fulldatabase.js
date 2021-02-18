const admin = require('./firebaseadmin');

exports.handler = async (req, resp) => {
	const categories = admin.db.ref('/categories');
	const counties = admin.db.ref('/counties');
	const resources = admin.db.ref('/resources');
	var catSnapshot;
	var countySnapshot;
	var resSnapshot;

	var resourcesList = [];

	await resources.orderByKey().once("value", (snapshot) => {
		resSnapshot = snapshot;
		resSnapshot.forEach((childSnap) => {
			resourcesList.push(childSnap.toJSON());
		});
	});

	var categoryList = [];

	await categories.orderByKey().once("value", (snapshot) => {
		catSnapshot = snapshot;
		catSnapshot.forEach((childSnap) => {
			categoryList.push(childSnap.toJSON());
		});
	});

	var countyList = [];

	await counties.orderByKey().once("value", (snapshot) => {
		countySnapshot = snapshot;
		countySnapshot.forEach((childSnap) => {
			countyList.push(childSnap.toJSON());
		});
	});

	resp.json({"resources": resourcesList, "counties": countyList, "categories": categoryList});
};