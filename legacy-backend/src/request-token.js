const fetch = require("node-fetch");

async function request_token(params) {
	let result = await fetch("https://rest.arbeitsagentur.de/oauth/gettoken_cc", {
		method: "POST",
		headers: {
			Host: "rest.arbeitsagentur.de",
			Accept: "*/*",
			"Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
			"Accept-Language": "en-us",
			"User-Agent": "Jobsuche/1070 CFNetwork/1220.1 Darwin/20.3.0",
		},
		body: "client_id=c003a37f-024f-462a-b36d-b001be4cd24a&client_secret=32a39620-32b3-4307-9aa1-511e3d7f48a8&grant_type=client_credentials",
	});

	let data = await result.json();
	return {
		token: { jwt: data.access_token, expires: Date.now() + data.expires_in * 1000 },
	};
}
