const openwhisk = require("openwhisk")
const ow = openwhisk()
const invoke = (actionName, params, result = true) =>
	ow.actions.invoke({ name: actionName, params: params, blocking: true, result: result })

async function handle_request(params) {
	let base_url = "https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v4"
	params.request_url = base_url + params.__ow_path + "?" + params.__ow_query
	try {
		let doc = await invoke("jobsuche-db/read-document", { id: params.request_url })
		let diff = Date.now() - doc.createdAt
		let diff_hours = diff / 1000 / 60 / 60
		if (diff_hours > 12) {
			doc.result = await invoke("jobsuche-dev/send-request", {
				...params,
				token: await get_token(params),
			})
			await update_doc({ doc: doc })
		}
		return { result: doc.result }
	} catch (err) {
		// TODO: Check for specific kind of error
		console.log("Document probably doesn't exist")
		console.log(err)

		let result = await invoke("jobsuche-dev/send-request", {
			...params,
			token: await get_token(params),
		})
		await invoke("jobsuche-db/create-document", {
			doc: { _id: params.request_url, result: result, createdAt: Date.now() },
		})

		return { result: result }
	}
}

async function update_doc(params) {
	return await invoke("jobsuche-db/update-document", {
		doc: { ...params.doc, createdAt: Date.now() },
	})
}

async function get_token(params) {
	let token = await invoke("jobsuche-dev/get-auth", params)

	if (Date.now() >= token.expires) {
		console.log("Requesting new token")
		token = await invoke("jobsuche-dev/request-token", params)
		await invoke("jobsuche-dev/refresh-token", { ...params, token: token })
	}

	return token
}
