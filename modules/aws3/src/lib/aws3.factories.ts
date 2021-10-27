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
      switchMap(({ s3, identity }) => params && Object.keys(params).length !== 0 ? forkJoin(Object.keys(params).map(name => paramsEvaluatorService.paramValue(params[name], new Map<string, any>()).pipe(map(v => ({ [name]: v }))))).pipe(
        map(groups => groups.reduce((p, c) => ({ ...p, ...c }), {})), // default options go here instead of empty object.
        map(options => ({ s3, identity, options }))
      ): of({ s3, identity, options: {} })),
      map(({ s3, identity, options }) => {
        const name = options.prefix + identity + '.json';
        const command = new PutObjectCommand({
          Bucket: options.bucket,
          Key: name,
          Body: JSON.stringify(object),
          ContentType: 'application/json'
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