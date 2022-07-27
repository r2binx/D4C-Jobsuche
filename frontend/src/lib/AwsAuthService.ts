import { reactive, ref } from "vue";
import {
	CognitoUserPool,
	CognitoUserAttribute,
	CognitoUser,
	AuthenticationDetails,
	CognitoUserSession,
	IAuthenticationDetailsData,
	CognitoIdToken,
	CognitoRefreshToken,
	ISignUpResult,
} from "amazon-cognito-identity-js";

export class AwsAuthService {
	private readonly COGNITO_USER_POOL_ID = "us-east-1_0wzzrGL8e";
	private readonly COGNITO_CLIENT_ID = "4kr817atebosg4cssr7lfbjcf8";

	private userPool = new CognitoUserPool({
		UserPoolId: this.COGNITO_USER_POOL_ID,
		ClientId: this.COGNITO_CLIENT_ID,
	});
	private cognitoUser: CognitoUser | null = null;

	public initialized = ref(false);
	public currentUser = ref<UserData | null>(null);
	public loading = ref(false);

	public init = async () => {
		const user = this.userPool.getCurrentUser();

		if (!!!user) {
			this.initialized.value = true;
			return;
		}

		user.getSession((err: Error | null, session: CognitoUserSession) => {
			if (!!err) {
				console.log(err);
			} else if (session.isValid()) {
				this.setUser(user, session.getIdToken(), session.getRefreshToken());
			}
			this.initialized.value = true;
		});
	};

	private setUser = (
		user: CognitoUser,
		idToken: CognitoIdToken,
		refreshToken: CognitoRefreshToken
	) => {
		const data = idToken.decodePayload();
		this.currentUser.value = {
			Username: data["cognito:username"],
			Email: data.email,
			Sub: data.sub,
			IdToken: idToken.getJwtToken(),
			RefreshToken: refreshToken,
		};

		const now = new Date().getTime();
		const remaining = idToken.getExpiration() - now - 3;
		setTimeout(() => {
			this.refreshSession();
		}, remaining);

		this.cognitoUser = user;
	};

	private refreshSession = () => {
		if (!this.cognitoUser) {
			return console.log(
				"Failed to refresh Token because no current cognitoUser available"
			);
		}
		if (!this.currentUser.value) {
			return console.log(
				"Failed to refresh Token because no current currentUser available"
			);
		}

		this.cognitoUser.refreshSession(
			this.currentUser.value?.RefreshToken as CognitoRefreshToken,
			(error: Error | null, session: CognitoUserSession) => {
				if (!!error) {
					console.log(error);
					return;
				}
				this.setUser(
					this.cognitoUser as CognitoUser,
					session.getIdToken(),
					session.getRefreshToken()
				);
			}
		);
	};

	public signIn = async (username: string, password: string) => {
		this.loading.value = true;

		const authDataDetails = new AuthenticationDetails({
			Username: username,
			Password: password,
		});
		const user = new CognitoUser({
			Username: authDataDetails.getUsername(),
			Pool: this.userPool,
		});

		return new Promise((resolve, reject) => {
			user.authenticateUser(authDataDetails, {
				onSuccess: (result) => {
					this.setUser(user, result.getIdToken(), result.getRefreshToken());
					this.loading.value = false;
					resolve(this.currentUser);
				},
				onFailure: (error: Error) => {
					this.loading.value = false;
					switch (error.name) {
						case "NotAuthorizedException":
							reject(AwsErrorCode.InvalidLogin);
							break;
						case "UserNotConfirmedException":
							reject(AwsErrorCode.VerifyEmailRequired);
							break;
					}
				},
				newPasswordRequired: () => {
					this.loading.value = false;
					reject(AwsErrorCode.NewPasswordRequired);
				},
			});
		});
	};

	public signOut = async () => {
		this.loading.value = true;
		return new Promise((resolve, reject) => {
			this.cognitoUser?.signOut(() => {
				this.currentUser.value = null;
				this.loading.value = false;
				resolve(null);
			});
		});
	};

	public register = async (username: string, password: string, email: string) => {
		this.loading.value = true;

		const dataEmail = {
			Name: "email",
			Value: email,
		};
		var attributeEmail = new CognitoUserAttribute(dataEmail);

		return new Promise((resolve, reject) => {
			this.userPool.signUp(
				username,
				password,
				[attributeEmail],
				[],
				(err, result) => {
					if (err) {
						console.log(err.message);
						this.loading.value = false;
						reject(err);
					} else {
						this.loading.value = false;
						resolve(result as ISignUpResult);
					}
				}
			);
		});
	};
}

export interface UserData {
	Username: string;
	Password?: string;
	Email: string;
	Sub: string;
	IdToken: string;
	RefreshToken: CognitoRefreshToken;
}

export enum AwsErrorCode {
	NewPasswordRequired,
	VerifyEmailRequired,
	InvalidLogin,
	PasswordRepeatNoMatch,
}
