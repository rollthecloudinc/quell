import { CognitoSettings } from '@ng-druid/awcog';
import { AwsRum, AwsRumConfig } from 'aws-rum-web';
import { Observable } from 'rxjs';
import { CloudwatchRumSettings } from './models/rum.models';

export const initializeRumMonitorFactory = (cognitoSettings: CognitoSettings, rumConfig: CloudwatchRumSettings): () => Observable<any> => {
  return () => new Observable(obs => {
    try {
      const config: AwsRumConfig = {
        sessionSampleRate: 1,
        identityPoolId: cognitoSettings.identityPoolId,
        guestRoleArn: rumConfig.guestRoleArn,
        endpoint: "https://dataplane.rum." + cognitoSettings.region + ".amazonaws.com",
        telemetries: ["performance","errors","http"],
        allowCookies: true,
        enableXRay: true
      };
    
      const APPLICATION_ID: string = rumConfig.appId;
      const APPLICATION_VERSION: string = '1.0.0';
      const APPLICATION_REGION = cognitoSettings.region;
    
      const awsRum: AwsRum = new AwsRum(
        APPLICATION_ID,
        APPLICATION_VERSION,
        APPLICATION_REGION,
        config
      );
    } catch (error) {
      // Ignore errors thrown during CloudWatch RUM web client initialization
    }
    obs.next();
    obs.complete();
  });
 };