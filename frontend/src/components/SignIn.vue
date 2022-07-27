<script setup lang="ts">
import { AwsAuthService, AwsErrorCode } from '../lib/AwsAuthService';

enum AuthState {
    None,
    EmailTaken,
    SuccesRegister,
    ValidateEmailRequired,
    LoginFailed,
    PasswordRepeatNoMatch
}

const authService = inject("AwsAuthService") as AwsAuthService;
const register = ref(0);
const userFormData = $ref({
    Username: "",
    Password: "",
    PasswordRepeat: "",
    Email: ""
});

const formRef = ref();

const authState = ref(AuthState.None);

watch(() => register.value, () => { authState.value = AuthState.None; });

function authenticate() {
    authState.value = AuthState.None;

    formRef.value.validate(async (errors) => {
        if (errors) return console.error(errors);
        try {
            if (register.value == 1) {
                if (userFormData.Password !== userFormData.PasswordRepeat) {
                    throw AwsErrorCode.PasswordRepeatNoMatch;
                }
                await authService.register(userFormData.Username, userFormData.Password, userFormData.Email);
                authState.value = AuthState.SuccesRegister;
            } else {
                await authService.signIn(userFormData.Username, userFormData.Password);
            }
        } catch (error) {
            switch (error) {
                case AwsErrorCode.InvalidLogin:
                    authState.value = AuthState.LoginFailed;
                    break;
                case AwsErrorCode.VerifyEmailRequired:
                    authState.value = AuthState.ValidateEmailRequired;
                    break;
                case AwsErrorCode.PasswordRepeatNoMatch:
                    authState.value = AuthState.PasswordRepeatNoMatch;
                    break;
            }
        }
    });
}

</script>

<template>
    <n-space justify="space-around" align="center">
        <n-radio-group v-model:value="register">
            <n-radio-button value=0 round>Anmelden</n-radio-button>
            <n-radio-button value=1 round>Registrieren</n-radio-button>
        </n-radio-group>
    </n-space>
    <n-divider />
    <div>
        <n-space vertical align="center">
            <n-form ref="formRef" :model="userFormData" style="margin: 1rem">
                <n-form-item label="Benutzername" path="Username">
                    <n-input v-model:value="userFormData.Username" @keyup.enter="authenticate" />
                </n-form-item>
                <n-form-item label="Passwort" path="Password">
                    <n-input v-model:value="userFormData.Password" type="password" @keyup.enter="authenticate" />
                </n-form-item>
                <n-form-item v-if="register == 1" label="Passwort wiederholen" path="PasswordRepeat">
                    <n-input v-model:value="userFormData.PasswordRepeat" type="password" @keyup.enter="authenticate" />
                </n-form-item>
                <n-form-item v-if="register == 1" label="Email" path="Email">
                    <n-input v-model:value="userFormData.Email" @keyup.enter="authenticate" />
                </n-form-item>
            </n-form>
            <n-space>
                <n-spin v-if="authService.loading.value" />
                <n-button v-else-if="register == 0" type="primary" @click="authenticate" @keyup.enter="authenticate">
                    Login
                </n-button>
                <n-button v-else type="primary" @click="authenticate" @keyup.enter="authenticate">Registrieren
                </n-button>
            </n-space>
            <n-space style="margin: 1rem">
                <n-alert v-if="authState == AuthState.EmailTaken" title="Fehler" type="error">
                    Diese Email wird bereits verwendet!
                </n-alert>
                <n-alert v-if="authState == AuthState.SuccesRegister" title="Registrierung erfolgreich" type="success">
                    Sie haben sich erfolgreich registriert. Bitte sehen Sie in Ihrem Email Postfach nach und klicken Sie
                    auf
                    den
                    Bestätigungslink.
                </n-alert>
                <n-alert v-if="authState == AuthState.ValidateEmailRequired" title="Fehler" type="warning">
                    Ihr Account wurde noch nicht verifiziert. Bitte sehen Sie in Ihrem Email Postfach nach und klicken
                    Sie
                    auf
                    den
                    Bestätigungslink.
                </n-alert>
                <n-alert v-if="authState == AuthState.LoginFailed" title="Fehler" type="error">
                    Falscher Benutzername oder Passwort.
                </n-alert>
                <n-alert v-if="authState == AuthState.PasswordRepeatNoMatch" title="Fehler" type="error">
                    Passwörter stimmen nicht überein!
                </n-alert>
            </n-space>
        </n-space>
    </div>
</template>