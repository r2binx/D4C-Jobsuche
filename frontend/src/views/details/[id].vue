<script setup>
const route = useRoute();
const job = JSON.parse(route.params.job);
</script>
<template>
	<JobDetails :job="job" />
</template>
