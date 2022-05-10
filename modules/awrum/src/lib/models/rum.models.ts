export class CloudwatchRumSettings {
  appId: string;
  guestRoleArn: string;
  constructor(data: CloudwatchRumSettings) {
    if (data) {
      this.appId = data.appId;
      this.guestRoleArn = data.guestRoleArn;
    }
  }
} 