<script setup>
const props = defineProps({
	id: {
		type: String,
		required: true,
	},
});
</script>
<template>
	<JobDetails :id="props.id" />
</template>
