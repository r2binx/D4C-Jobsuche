<script setup lang="ts">
import { AwsAuthService } from '../lib/AwsAuthService';


const authService = inject("AwsAuthService") as AwsAuthService;


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
                <n-text strong>{{ authService.currentUser.value?.Username }}</n-text>
            </n-space>
            <n-space justify="space-around">
                <n-text>Email:</n-text>
                <n-text strong>{{ authService.currentUser.value?.Email }}</n-text>
            </n-space>
            <n-spin v-if="authService.loading.value"></n-spin>
            <n-button v-else secondary @click="authService.signOut">Logout</n-button>
        </n-space>
    </div>
</template>
