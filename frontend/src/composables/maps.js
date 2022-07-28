import { Loader } from "@googlemaps/js-api-loader";

export function useAutocomplete() {
	let suggestions = $ref([]);
	const autocompleteOptions = {
		types: ["(cities)"],
		componentRestrictions: { country: "de" },
	};
	const getService = async () => {
		const loader = new Loader({
			apiKey: import.meta.env.VITE_MAPS_API_KEY,
			version: "weekly",
			region: "DE",
			libraries: ["places"],
		});

		return loader
			.load()
			.then((google) => {
				return new google.maps.places.AutocompleteService();
			})
			.catch((e) => {
				console.error("Failed loading places autocomplete service", e);
			});
	};

	const getPredictions = async (input) => {
		const service = await getService();

		service.getPlacePredictions(
			{ input: input, ...autocompleteOptions },
			updateSuggestions
		);
	};

	function updateSuggestions(predictions, status) {
		if (status !== window.google.maps.places.PlacesServiceStatus.OK) {
			suggestions = [];
			return;
		}
		suggestions = [
			// remove duplicates
			...new Set(
				predictions.map((prediction) => {
					return {
						value: prediction.description,
						label: prediction.description,
					};
				})
			),
		];
	}

	return $$({ getPredictions, suggestions });
}
