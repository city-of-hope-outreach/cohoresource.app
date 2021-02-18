const admin = require('./firebaseadmin');

exports.handler = async (req, resp) => {
	const feedbackRef = admin.db.ref('/feedback');
	const validationRef = admin.db.ref("/feedbackvalidation");
	console.log("feeeeeeeeedback");
	const apikey = req.body.apikey;
	const secret = req.body.secret;
	const type = req.body.type;
	const resource = req.body.resource;
	const comments = req.body.comments;

	if (apikey && secret && type && resource && comments) {
		// console.log("key: ", apikey, ", secret: ", secret, ", type: ", type, ", resource: ", resource, ", comments: ", comments);
		// TODO: validate apikey and secret, send type, resource,  and comments to database
		let actualkey;
		let actualsecret;

		await validationRef.once("value", (snapshot) => {
			actualkey = snapshot.child("apikey").val();
			actualsecret = snapshot.child("secret").val();
		});

		if (apikey == actualkey && secret == actualsecret) {
			feedbackRef.push({"type": type, "resource":resource, "comments":comments});
			resp.send("Feedback posted");
		} else {
			resp.send("Invalid API key and secret");
		}
	} else {
		resp.send("Invalid Params");
		return;
	}

	resp.send(req.rawBody);
};