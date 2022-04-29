const COS = require("ibm-cos-sdk")

function cos_client(params) {
	let bx_creds = params["__bx_creds"]
	if (!bx_creds) throw new Error("Missing __bx_creds parameter.")

	let cos_creds = bx_creds["cloud-object-storage"]
	if (!cos_creds) throw new Error("Missing cloud-object-storage parameter.")

	let endpoint = params["cos_endpoint"]
	if (!endpoint) throw new Error("Missing cos_endpoint parameter.")

	let config = {
		endpoint: endpoint,
		apiKeyId: cos_creds.apikey,
		serviceInstanceId: cos_creds.resource_instance_id,
	}

	return new COS.S3(config)
}

async function refresh_token(params) {
	if (!params.bucket) throw new Error("Missing bucket parameter.")
	if (!params.name) params.name = "jobsuche_token.json"
	await delete_obj(params)
	await upload({
		...params,
		body: JSON.stringify(params.token),
	})

	return { token: params.token }
}

async function delete_obj(params) {
	if (!params.bucket) throw new Error("Missing bucket parameter.")
	if (!params.name) params.name = "jobsuche_token.json"
	const result = params
	let response
	let client = cos_client(params)
	let object = {
		Bucket: params.bucket,
		Key: params.name,
	}
	try {
		response = await client.deleteObject(object).promise()
	} catch (err) {
		console.log(err)
		result.message = err.message
		throw result
	}

	result.body = response
	return result
}

async function upload(params) {
	if (!params.bucket) throw new Error("Missing bucket parameter.")
	if (!params.body) throw new Error("Missing object parameter.")
	if (!params.name) params.name = "jobsuche_token.json"
	const result = params
	let response
	let client = cos_client(params)
	let object = {
		Bucket: params.bucket,
		Key: params.name,
		Body: params.body,
		ContentType: "application/json",
	}
	try {
		response = await client.putObject(object).promise()
	} catch (err) {
		console.log(err)
		result.message = err.message
		throw result
	}
	result.body = response
	return result
}
