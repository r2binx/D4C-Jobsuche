<script setup>
const props = defineProps({
	id: {
		type: String,
		required: true,
	},
});

const { data, error, loading, getData, abort } = useApi();

getData("/details?" + new URLSearchParams({ id: props.id }));
</script>
<template>
	{{ props.id }}
	<n-card>
		<n-spin v-if="loading" size="large" />
		<pra v-else>
			{{ data }}
		</pra>
	</n-card>
</template>
