<script setup lang="ts">
import SignIn from "./components/SignIn.vue";
import Profile from "./components/Profile.vue";
import { AwsAuthService } from "./lib/AwsAuthService";

const authService = inject("AwsAuthService") as AwsAuthService;
const showUserModal = ref(false);
</script>

<template>
	<n-space align="center" item-style="margin-left: auto;">
		<router-link :to="'/'">
			<n-h1>Jobsuche</n-h1>
		</router-link>
		<n-space
			v-if="!!authService.currentUser.value"
			align="center"
			style="margin-top: -25px"
		>
			<n-spin v-if="authService.loading.value"></n-spin>
			<n-button v-else secondary @click="authService.signOut">Logout</n-button>
			<n-avatar
				round
				size="large"
				src="https://img.icons8.com/ios-glyphs/344/user--v1.png"
				@click="showUserModal = true"
				style="cursor: pointer"
			/>
		</n-space>
		<n-space v-else align="center" style="margin-top: -25px">
			<n-spin v-if="authService.loading.value"></n-spin>
			<n-button v-else secondary @click="showUserModal = true">Login</n-button>
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
			<n-spin v-if="!authService.initialized" />
			<SignIn v-else-if="!authService.currentUser.value" />
			<Profile v-else />
			<template #footer>
				<n-divider />
				<n-space justify="end">
					<n-button secondary @click="showUserModal = false"
						>Schließen</n-button
					>
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
