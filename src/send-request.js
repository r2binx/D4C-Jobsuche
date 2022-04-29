const fetch = require("node-fetch")

async function send_request(params) {
	let result = await fetch(params.request_url, {
		headers: {
			"Cache-Control": "no-cache",
			DNT: "1",
			OAuthAccessToken: params.token.jwt,
			Pragma: "no-cache",
		},
	})
	return result.json()
}
