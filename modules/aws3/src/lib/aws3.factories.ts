import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { AuthFacade } from 'auth';
import { CrudAdaptorPlugin, CrudOperationResponse, CrudOperationInput } from 'crud';
import { Observable, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';

export const s3EntityCrudAdaptorPluginFactory = (authFacade: AuthFacade) => {
  return new CrudAdaptorPlugin<string>({
    id: 'aws_s3_entity',
    title: 'AWS S3 Entity',
    create: ({ object, identity }: CrudOperationInput) => of({ success: false }).pipe(
      map(() => buildClient(authFacade)),
      switchMap(s3 => identity({ object }).pipe(
        map(({ identity }) => ({ s3, identity }))
      )),
      map(({ s3, identity }) => {
        // additional params needed here. - name builder, bucket, key 
        const name = 'panelpages/' + identity + '.json';
        // const content = gzip.zip(JSON.stringify(entity), { name });
        const command = new PutObjectCommand({
          Bucket: 'classifieds-ui-dev',
          Key: name,
          Body: JSON.stringify(object),
          ContentType: 'application/json',
          //ContentEncoding: 'gzip'
        });
        return { s3, command };
      }),
      switchMap(({ s3, command }) => new Observable<CrudOperationResponse>(obs => {
        s3.send(command).then(res => {
          console.log('sent');
          console.log(res);
          obs.next({ success: true });
          obs.complete();
        }).catch(e => {
          console.log('error')
          console.log(e);
          obs.next({ success: false })
          obs.complete();
        });
      }))
    ),
    read: ({ }: CrudOperationInput) => of<CrudOperationResponse>({ success: false }),
    update: ({ }: CrudOperationInput) => of<CrudOperationResponse>({ success: false }),
    delete: ({ }: CrudOperationInput) => of<CrudOperationResponse>({ success: false })
  });
};

// @todo: use config values from somewhere. - prob awcog will host config
const buildClient = (authFacade: AuthFacade) => new S3Client({
  region: 'us-east-1',
  credentials: fromCognitoIdentityPool({
    client: new CognitoIdentityClient({ region: 'us-east-1' }),
    identityPoolId: 'us-east-1:6f5cdc41-35b0-41ca-9f6b-7eca11320942',
    // userPool: 'us-east-1_z8PhK3D8V',
    logins: {
      'cognito-idp.us-east-1.amazonaws.com/us-east-1_z8PhK3D8V': () => authFacade.getUser$.pipe(map(u => u ? u.id_token : undefined), take(1)).toPromise()
    }
  }),
});