<script setup>
import JobResult from "./JobResult.vue";

const { data, error, loading, getData, abort } = useApi();
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

function makeRequest() {
	formRef.value.validate((errors) => {
		if (errors) return console.error(errors);

		getData(searchQuery);
	});
}
</script>
<template>
	<n-form ref="formRef" :model="searchQuery" style="margin-bottom: 1rem">
		<n-space justify="space-around" align="center">
			<n-form-item label="Was?" path="search">
				<n-input
					v-model:value="searchQuery.search"
					@keyup.enter="makeRequest"
					placeholder="Suche"
				/>
			</n-form-item>
			<n-form-item label="Wo?" path="place">
				<n-input
					v-model:value="searchQuery.place"
					@keyup.enter="makeRequest"
					placeholder="Ort"
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
			<JobResult
				v-for="result in data?.result.stellenangebote"
				:key="result.hashId"
				:job="result"
			/>
		</div>
		<pre v-else>{{ error }}</pre>
	</template>
</template>
