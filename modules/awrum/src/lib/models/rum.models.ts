export class CloudwatchRumSettings {
  appId: string;
  guestRoleArn: string;
  region: string;
  identityPoolId: string;
  constructor(data: CloudwatchRumSettings) {
    if (data) {
      this.appId = data.appId;
      this.guestRoleArn = data.guestRoleArn;
      this.region = data.region;
      this.identityPoolId = data.identityPoolId;
    }
  }
} 