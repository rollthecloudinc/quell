import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { AuthFacade } from 'auth';
import { CognitoSettings } from 'awcog';
import { CrudAdaptorPlugin, CrudOperationResponse, CrudOperationInput } from 'crud';
import { ParamEvaluatorService } from 'dparam';
import { forkJoin, Observable, of } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';

export const s3EntityCrudAdaptorPluginFactory = (authFacade: AuthFacade, cognitoSettings: CognitoSettings, paramsEvaluatorService: ParamEvaluatorService) => {
  return new CrudAdaptorPlugin<string>({
    id: 'aws_s3_entity',
    title: 'AWS S3 Entity',
    create: ({ object, identity, params }: CrudOperationInput) => of({ success: false }).pipe(
      map(() => buildClient(authFacade, cognitoSettings)),
      switchMap(s3 => identity({ object }).pipe(
        map(({ identity }) => ({ s3, identity }))
      )),
      switchMap(({ s3, identity }) => params && params.length !== 0 ? forkJoin(params.map(p => paramsEvaluatorService.paramValue(p, new Map<string, any>()))).pipe(
        tap(ep => console.log(ep)),
        map(() => ({ s3, identity }))
      ): of({ s3, identity })),
      map(({ s3, identity }) => {
        // additional params needed here. - name builder, bucket, key 
        // const name = ep.prefix + '/' + identity + '.json';
        const name = 'panelpages/' + identity + '.json';
        // const content = gzip.zip(JSON.stringify(entity), { name });
        const command = new PutObjectCommand({
          Bucket: 'classifieds-ui-dev', // ep.bucket
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

const buildClient = (authFacade: AuthFacade, cognitoSettings: CognitoSettings) => new S3Client({
  region: cognitoSettings.region,
  credentials: fromCognitoIdentityPool({
    client: new CognitoIdentityClient({ region: cognitoSettings.region }),
    identityPoolId: cognitoSettings.identityPoolId,
    logins: {
      [`cognito-idp.${cognitoSettings.region}.amazonaws.com/${cognitoSettings.userPoolId}`]: () => authFacade.getUser$.pipe(map(u => u ? u.id_token : undefined), take(1)).toPromise()
    }
  }),
});