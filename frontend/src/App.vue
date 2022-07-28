<script setup>
let showUserModal = $ref(false);
const toggleUserModal = () => (showUserModal = !showUserModal);

let {
	initialized: authInitialized,
	loading: authLoading,
	currentUser,
	signOut,
} = $(inject("AwsAuthService"));
</script>

<template>
	<n-space align="center" item-style="margin-left: auto;">
		<router-link :to="'/'">
			<n-h1>Jobsuche</n-h1>
		</router-link>
		<n-space v-if="!!currentUser" align="center" style="margin-top: -25px">
			<n-spin v-if="authLoading"></n-spin>
			<n-button v-else secondary @click="signOut">Logout</n-button>
			<n-avatar
				round
				size="large"
				src="https://img.icons8.com/ios-glyphs/344/user--v1.png"
				style="cursor: pointer"
				@click="toggleUserModal"
			/>
		</n-space>
		<n-space v-else align="center" style="margin-top: -25px">
			<n-spin v-if="authLoading"></n-spin>
			<n-button v-else secondary @click="toggleUserModal">Login</n-button>
		</n-space>
	</n-space>
	<n-divider></n-divider>
	<router-view />
	<n-modal v-model:show="showUserModal">
		<n-card
			style="width: 600px"
			:bordered="false"
			size="huge"
			role="dialog"
			aria-modal="true"
		>
			<n-spin v-if="!authInitialized" />
			<SignIn v-else-if="!currentUser" />
			<Profile v-else />
			<template #footer>
				<n-divider />
				<n-space justify="end">
					<n-button secondary @click="toggleUserModal">Schließen</n-button>
				</n-space>
			</template>
		</n-card>
	</n-modal>
</template>

<style>
#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
	margin-top: 60px;
	width: min(100% - 2rem, 950px);
	margin-inline: auto;
}
</style>
