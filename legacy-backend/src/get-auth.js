const COS = require("ibm-cos-sdk");

function cos_client(params) {
	let bx_creds = params["__bx_creds"];
	if (!bx_creds) throw new Error("Missing __bx_creds parameter.");

	let cos_creds = bx_creds["cloud-object-storage"];
	if (!cos_creds) throw new Error("Missing cloud-object-storage parameter.");

	let endpoint = params["cos_endpoint"];
	if (!endpoint) throw new Error("Missing cos_endpoint parameter.");

	let config = {
		endpoint: endpoint,
		apiKeyId: cos_creds.apikey,
		serviceInstanceId: cos_creds.resource_instance_id,
	};

	return new COS.S3(config);
}

async function get_auth(params) {
	if (!params.bucket) throw new Error("Missing bucket parameter.");
	if (!params.name) params.name = "jobsuche_token.json";

	let client = cos_client(params);
	let response = await client
		.getObject({ Bucket: params.bucket, Key: params.name })
		.promise();

	return { token: JSON.parse(Buffer.from(response.Body)) };
}
