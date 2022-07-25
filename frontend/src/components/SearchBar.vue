<script setup>
import JobResult from "./JobResult.vue";

const { data, error, loading, getData, abort } = useApi();
const jobResultStore = inject("jobResultStore");

const searchQuery = $ref({
	search: "",
	place: "",
	radius: 15,
	type: 1,
	page: 1,
});

const typeOptions = [
	{
		label: "Arbeit",
		value: 1,
	},
	{
		label: "Selbstständigkeit",
		value: 2,
	},
	{
		label: "Ausbildung/Duales Studium",
		value: 4,
	},
	{
		label: "Praktikum",
		value: 34,
	},
];

const formRef = ref();

function buildQuery(query) {
	let parameters = {
		angebotsart: query.type,
		umkreis: query.radius,
		page: query.page,
		size: 25,
	};

	// add parameters only if value defined
	parameters = {
		...parameters,
		...(query.place && { wo: query.place }),
		...(query.search && { was: query.search }),
	};

	return "/jobs?" + new URLSearchParams(parameters);
}

function makeRequest() {
	formRef.value.validate((errors) => {
		if (errors) return console.error(errors);

		// make request
		getData(buildQuery(searchQuery));

		// update store when data changes
		watch(data, (newData) => {
			let totalResults = newData?.result.maxErgebnisse;

			searchQuery = {
				...searchQuery,
				...(totalResults && { totalPages: Math.ceil(totalResults / 25) }),
			};

			// add result to store
			jobResultStore.addData(newData?.result.stellenangebote, searchQuery.page);
		});
	});
}

// watch for page changes
watch(
	() => searchQuery.page,
	(newPage) => {
		console.log(`Page changed to ${newPage}`);
		if (!jobResultStore.getData(newPage)) makeRequest();
	}
);
</script>
<template>
	<n-form ref="formRef" :model="searchQuery" style="margin-bottom: 1rem">
		<n-space justify="space-around" align="center">
			<n-form-item label="Was?" path="search">
				<n-input
					v-model:value="searchQuery.search"
					placeholder="Suche"
					@keyup.enter="makeRequest"
				/>
			</n-form-item>
			<n-form-item label="Wo?" path="place">
				<n-input
					v-model:value="searchQuery.place"
					placeholder="Ort"
					@keyup.enter="makeRequest"
				/>
			</n-form-item>
			<n-form-item label="Art?" path="type">
				<n-select
					v-model:value="searchQuery.type"
					style="width: 200px"
					:options="typeOptions"
				/>
			</n-form-item>
			<n-form-item label="Umkreis?" path="radius">
				<n-input-number
					v-model:value="searchQuery.radius"
					:step="5"
					style="width: 120px"
				>
					<template #suffix>Km</template>
				</n-input-number>
			</n-form-item>

			<n-button type="primary" @click="makeRequest">Suchen</n-button>
			<n-button v-if="loading" type="warning" @click="abort()">Abbrechen</n-button>
		</n-space>
	</n-form>
	<n-spin v-if="loading" size="large" />
	<template v-else>
		<div v-if="!error">
			<n-pagination
				v-if="searchQuery.totalPages"
				v-model:page="searchQuery.page"
				:page-count="searchQuery.totalPages"
				style="margin: 2rem 0; justify-content: center"
			/>
			<JobResult
				v-for="result in jobResultStore.getData(searchQuery.page)"
				:key="result.hashId"
				:job="result"
			/>
			<n-pagination
				v-if="searchQuery.totalPages"
				v-model:page="searchQuery.page"
				:page-count="searchQuery.totalPages"
				style="margin: 2rem 0; justify-content: center"
			/>
		</div>
		<pre v-else>{{ error }}</pre>
	</template>
</template>
