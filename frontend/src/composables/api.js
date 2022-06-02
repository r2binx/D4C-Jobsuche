export function useApi() {
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

		fetch(url, { signal: controller.signal })
			.then((res) => res.json())
			.then((json) => (data = json))
			.catch((err) => (error = err))
			.finally(() => (loading = false));
	};

	return $$({ data, error, loading, getData, abort });
}
