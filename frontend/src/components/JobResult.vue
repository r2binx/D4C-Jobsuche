<script setup>
defineProps({
	job: {
		type: Object,
		required: true,
	},
});

const router = useRouter();
</script>
<template>
	<n-card
		hoverable
		embedded
		:segmented="{
			content: true,
			footer: 'soft',
			action: 'soft',
		}"
		style="margin-bottom: 2rem"
	>
		<template #header>
			<n-text style="float: left">
				{{ job.arbeitgeber }}
			</n-text>
		</template>
		<template #header-extra>
			{{ new Date(job.aktuelleVeroeffentlichungsdatum).toLocaleDateString() }}
		</template>
		<ul style="float: left; text-align: left">
			<li>Stelle: {{ job.titel }}</li>
			<li>Ab {{ new Date(job.eintrittsdatum).toLocaleDateString() }}</li>
			<li>In {{ job.arbeitsort.ort }}</li>
		</ul>
		<template #action>
			<n-button
				style="float: right"
				type="primary"
				@click="
					router.push({
						name: 'details-id',
						params: { id: job.hashId },
					})
				"
				>Details</n-button
			>
		</template>
		<template #footer>
			<div style="float: left; color: lightgray; font-size: small">
				Referenz: {{ job.refnr }}
			</div>
		</template>
	</n-card>
</template>
