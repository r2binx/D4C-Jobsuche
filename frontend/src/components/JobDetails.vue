<script setup>
const props = defineProps({
	job: {
		type: Object,
		required: true,
	},
});
</script>
<template>
	<n-card>
		<pre>
		{{ props.job }}
        </pre>
	</n-card>
</template>
