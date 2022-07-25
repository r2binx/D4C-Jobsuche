export function useApi(awsAuthService = null) {
	const data = $ref(null);
	const error = $ref(null);
	const loading = $ref(false);
	const controller = new AbortController();

	const abort = () => controller.abort();

	const getData = async (query) => {
		data = null;
		error = null;
		loading = true;

		let url = import.meta.env.VITE_API_ENDPOINT + query;

		runFetch(url, params);
	};

	const postData = async (query, postData) => {
		data = null;
		error = null;
		loading = true;

		let url = import.meta.env.VITE_API_ENDPOINT + query;
		const params = getParams();
		params.body = postData;

		runFetch(url, params);
	};

	const getParams = () => {
		const params = { signal: controller.signal };

		if (!!awsAuthService) {
			if (!awsAuthService.currentUser.value?.IdToken) {
				console.log(
					"Authenticated fetch failed because no Authorization Token was available"
				);
			} else {
				params.headers = {
					Authorization: awsAuthService.currentUser.value.IdToken,
				};
			}
		}
		return params;
	};

	const runFetch = (url, params) => {
		fetch(url, params)
			.then((res) => res.json())
			.then((json) => (data = json))
			.catch((err) => (error = err))
			.finally(() => (loading = false));
	};

	return $$({ data, error, loading, getData, postData, abort });
}
