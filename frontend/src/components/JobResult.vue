<script setup>
defineProps({
	job: {
		type: Object,
		required: true,
	},
});

const router = useRouter();

/**
  {
  "aktuelleVeroeffentlichungsdatum": "2022-06-02",
  "arbeitgeber": "Süd Personalmanagement GmbH",
  "arbeitsort": {
    "entfernung": "1",
    "koordinaten": {
      "lat": 48.7730095,
      "lon": 9.172655
    },
    "land": "Deutschland",
    "ort": "Stuttgart",
    "plz": "70178",
    "region": "Baden-Württemberg",
    "strasse": "Marienstr. 24"
  },
  "beruf": "Personaldienstleistungskaufmann/-frau",
  "eintrittsdatum": "2022-06-02",
  "hashId": "XsLTByCsW_gtjnxWbmoXbzD2LIX4jHn2dKpWNg2Wgog=",
  "logoHashId": "f743eh2yh1b4hKV8FVkzg7yFdCckqHaTPRP2bUlrz7U=",
  "modifikationsTimestamp": "2022-06-02T07:18:33.574",
  "refnr": "10000-1189502969-S",
  "titel": "Personaldisponent/in"
}
 */
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
			<li>Beruf: {{ job.titel }}</li>
			<li>Ab: {{ new Date(job.eintrittsdatum).toLocaleDateString() }}</li>
			<li>In: {{ job.arbeitsort.ort }}</li>
		</ul>
		<template #action>
			<n-button
				style="float: right"
				type="primary"
				@click="
					router.push({
						name: 'details-id',
						params: { id: job.hashId, job: JSON.stringify(job) },
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
