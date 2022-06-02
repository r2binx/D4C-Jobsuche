<script setup>
const props = defineProps({
	id: {
		type: String,
		required: true,
	},
});

const { data, error, loading, getData, abort } = useApi();

getData("/details/" + btoa(props.id));
</script>
<template>
	{{ props.id }}
	<n-card>
		<n-spin v-if="loading" size="large" />
		<pre v-else style="text-align: left">
			{{ JSON.stringify(data, null, 2) }}
		</pre
		>
	</n-card>
</template>
