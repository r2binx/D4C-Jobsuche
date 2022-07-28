<script setup>
const { loading: authLoading, currentUser, signOut } = inject("AwsAuthService");
</script>

<template>
	<n-space justify="space-around" align="center">
		<h2>Profil</h2>
	</n-space>
	<n-divider />
	<div>
		<n-space vertical align="center">
			<n-space justify="space-around">
				<n-text>Benutzername:</n-text>
				<n-text strong>{{ currentUser?.Username }}</n-text>
			</n-space>
			<n-space justify="space-around">
				<n-text>Email:</n-text>
				<n-text strong>{{ currentUser?.Email }}</n-text>
			</n-space>
			<n-spin v-if="authLoading"></n-spin>
			<n-button v-else secondary @click="signOut">Logout</n-button>
		</n-space>
	</div>
</template>
