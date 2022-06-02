export function useApi() {
	const data = $ref(null);
	const error = $ref(null);
	const loading = $ref(false);
	const controller = new AbortController();

	const abort = () => controller.abort();

	const getData = async (query) => {
		loading = true;

		let parameters = {
			angebotsart: query.type,
			umkreis: query.radius,
			page: query.page,
			size: 50,
		};

		// add parameters only if value defined
		parameters = {
			...parameters,
			...(query.place && { wo: query.place }),
			...(query.search && { was: query.search }),
		};
		console.log(parameters);

		let url =
			import.meta.env.VITE_API_ENDPOINT +
			"/jobs?" +
			new URLSearchParams(parameters);

		fetch(url, { signal: controller.signal })
			.then((res) => res.json())
			.then((json) => (data = json))
			.catch((err) => (error = err))
			.finally(() => (loading = false));
	};

	return $$({ data, error, loading, getData, abort });
}
