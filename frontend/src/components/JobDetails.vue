<script setup>
const props = defineProps({
	id: {
		type: String,
		required: true,
	},
});

const jobDetailStore = inject("jobDetailStore");
const { data, error, loading, getData, abort } = useApi();

if(!jobDetailStore.getData(props.id)){
	getData("/details/" + btoa(props.id));

	watch(data, (newData) => {
			jobDetailStore.addData(data, props.id);
		});
}

</script>
<template>
	{{ props.id }}
	<n-card>
		<n-spin v-if="loading" size="large" />
		<pre v-else style="text-align: left">
			{{ JSON.stringify(jobDetailStore.getData(props.id), null, 2) }}
		</pre
		>
	</n-card>
</template>
