const openwhisk = require("openwhisk");
const ow = openwhisk();
const invoke = (actionName, params, result = true) =>
	ow.actions.invoke({
		name: actionName,
		params: params,
		blocking: true,
		result: result,
	});

async function handle_request(params) {
	const baseUrl = "https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc";

	params.request_url = baseUrl;

	let requestPath = params.__ow_path.split("/");

	switch (requestPath[1]) {
		case "jobs":
			params.request_url += "/v4/app/jobs?" + params.__ow_query;
			break;
		case "details":
			if (requestPath[2]) {
				params.request_url += "/v2/jobdetails/" + requestPath[2];
			} else {
				console.log("No id in path");
			}
			break;
		default:
			console.log("Unknown path, not allowed: " + params.__ow_path);
			return;
	}

	return invoke("jobsuche-db/read-document", { id: params.request_url })
		.then(async (doc) => {
			let diff = Date.now() - doc.createdAt;
			let diff_hours = diff / 1000 / 60 / 60;
			if (diff_hours > 12) {
				doc.result = await forward_request(params);
				await update_doc({ doc: doc });
			}
			return { result: doc.result };
		})
		.catch(async (err) => {
			// TODO: Check for specific kind of error
			console.log("Document probably doesn't exist");
			console.log(err);

			let result = await forward_request(params);

			await invoke("jobsuche-db/create-document", {
				doc: { _id: params.request_url, result: result, createdAt: Date.now() },
			});

			return { result: result };
		});
}

async function forward_request(params) {
	return invoke("jobsuche-dev/send-request", {
		...params,
		token: await get_token(params),
	});
}

async function update_doc(params) {
	return invoke("jobsuche-db/update-document", {
		doc: { ...params.doc, createdAt: Date.now() },
	});
}

async function get_token(params) {
	return invoke("jobsuche-dev/get-auth", params).then((result) => {
		let token = result.token;
		if (Date.now() < token.expires) return token;

		// invoke sequence to refresh token in bucket
		console.log("Requesting new token");
		return invoke("jobsuche-dev/request-refresh-jwt", params).then((res) => {
			return res.token;
		});
	});
}
