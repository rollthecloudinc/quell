export class CognitoSettings {
  identityPoolId: string;
  region: string;
  userPoolId: string;
  constructor(data?: CognitoSettings) {
    if (data) {
      this.identityPoolId = data.identityPoolId;
      this.region = data.region;
      this.userPoolId = data.userPoolId;
    }
  }
}