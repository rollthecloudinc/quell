import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { AuthFacade } from 'auth';
import { CognitoSettings } from 'awcog';
import { CrudAdaptorPlugin, CrudOperationResponse, CrudOperationInput, CrudCollectionOperationInput, CrudCollectionOperationResponse } from 'crud';
import { ParamEvaluatorService } from 'dparam';
import { AllConditions, AnyConditions, ConditionProperties } from 'json-rules-engine';
import { forkJoin, iif, Observable, of } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import * as uuid from 'uuid';
import { SignatureV4 } from "@aws-sdk/signature-v4";
import { HttpRequest } from "@aws-sdk/protocol-http";
import { Sha256 } from "@aws-crypto/sha256-js";
import { HttpClient } from '@angular/common/http';
import { isPlatformServer } from '@angular/common';
import { AsyncApiCallHelperService } from 'utils';

export const s3EntityCrudAdaptorPluginFactory = (platformId: Object, authFacade: AuthFacade, cognitoSettings: CognitoSettings, paramsEvaluatorService: ParamEvaluatorService, http: HttpClient, asyncApiCallHelperSvc: AsyncApiCallHelperService, hostName?: string, protocol?: string) => {
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
          ContentType: 'application/json',
          CacheControl: `ETag: ${uuid.v4()}` // cache could be part of adaptor options - for now KISS
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
    update: ({ object, identity, params }: CrudOperationInput) => of({ success: false }).pipe(
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
          ContentType: 'application/json',
          CacheControl: `ETag: ${uuid.v4()}` // cache could be part of adaptor options - for now KISS
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
    delete: ({ }: CrudOperationInput) => of<CrudOperationResponse>({ success: false }),
    query: ({ rule, params }: CrudCollectionOperationInput) => of({ entities: [], success: false }).pipe(
      map(() => ({ identityCondition: (rule.conditions as AllConditions).all.map(c => (c as AnyConditions).any.find(c2 => (c2 as ConditionProperties).fact === 'identity')).find(c => !!c) })),
      switchMap(({ identityCondition }) => iif(
        () =>  identityCondition !== undefined && (identityCondition as ConditionProperties).fact === 'identity',
        of({ entities: [], success: false }).pipe(
          map(() => buildClient(authFacade, cognitoSettings)),
          switchMap( s3 => params && Object.keys(params).length !== 0 ? forkJoin(Object.keys(params).map(name => paramsEvaluatorService.paramValue(params[name], new Map<string, any>()).pipe(map(v => ({ [name]: v }))))).pipe(
            map(groups => groups.reduce((p, c) => ({ ...p, ...c }), {})), // default options go here instead of empty object.
            map(options => ({ s3, options }))
          ): of({ s3, options: {} })),
          /*map(({ s3, options }) => {
            const name = options.prefix + (identityCondition as ConditionProperties).value + '.json';
            const command = new GetObjectCommand({
              Bucket: options.bucket,
              Key: name
            });
            return { s3, command };
          }),*/
          /*switchMap(({ s3, command }) => new Observable<CrudCollectionOperationResponse>(obs => {
            s3.send(command)
              .then(res => new Response(res.Body as ReadableStream, {}))
              .then(res => res.json())
              .then(entity => {
              console.log('sent');
              // console.log(res);
              obs.next({ success: true, entities: [ entity ] });
              obs.complete();
            }).catch(e => {
              console.log('error')
              console.log(e);
              obs.next({ success: false, entities: [] })
              obs.complete();
            });
          }))*/
          switchMap(({ options }) => createSignedHttpRequest({
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                host: `${options.bucket}.s3.amazonaws.com`,
              },
              hostname: `${options.bucket}.s3.amazonaws.com`,
              path: `${options.prefix}${(identityCondition as ConditionProperties).value}.json`,
              protocol: 'https:',
              service: "s3",
              cognitoSettings: cognitoSettings,
              authFacade: authFacade
            }).pipe(
              map(signedHttpRequest => ({ signedHttpRequest, options }))
            )
          ),
          switchMap(( { signedHttpRequest, options }) => {
            // if (!isPlatformServer(platformId)) {
              delete signedHttpRequest.headers.host;
            // }
            // const url = `${ isPlatformServer(platformId) ? '' : '/opensearch' }${signedHttpRequest.path}`;
            const url = `${ isPlatformServer(platformId) ? /*'http://localhost:4000'*/ `${protocol}://${hostName}` : '' }/awproxy/s3/${options.bucket}${signedHttpRequest.path}`;
            console.log('url', url);
            return asyncApiCallHelperSvc.doTask(http.get(url, { headers: signedHttpRequest.headers, withCredentials: true }).toPromise()).pipe(
              map(res => ({ res, options }))
            );
            /*return http.get(url, { headers: signedHttpRequest.headers, withCredentials: true }).pipe(
              map(res => ({ res, options }))
            );*/
          }),
          tap(({ res }) => console.log(`panelpage id ${(res as any).id}`)),
          map(({ res }) => ({ entities: [ res ], success: true }))
        ),
        // Only implemented for GetObject (single object by identity) at the moment.
        of({ entities: [], success: false })
      ))
    )
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

interface CreateSignHttpRequestParams {
  body?: string;
  headers?: Record<string, string>;
  hostname: string;
  method?: string;
  path?: string;
  port?: number;
  protocol?: string;
  query?: Record<string, string>;
  service: string;
  cognitoSettings: CognitoSettings,
  authFacade: AuthFacade
}

const createSignedHttpRequest = ({
  body,
  headers,
  hostname,
  method = "GET",
  path = "/",
  port = 443,
  protocol = "https:",
  query,
  service,
  cognitoSettings,
  authFacade
}: CreateSignHttpRequestParams): Observable<HttpRequest> => new Observable<HttpRequest>(obs => {
  const httpRequest = new HttpRequest({
    body,
    headers,
    hostname,
    method,
    path,
    port,
    protocol,
    query,
  });
  const sigV4Init = {
    credentials: fromCognitoIdentityPool({
      client: new CognitoIdentityClient({ region: cognitoSettings.region }),
      identityPoolId: cognitoSettings.identityPoolId,
      logins: {
        [`cognito-idp.${cognitoSettings.region}.amazonaws.com/${cognitoSettings.userPoolId}`]: () => authFacade.getUser$.pipe(map(u => u ? u.id_token : undefined), take(1)).toPromise()
      }
    }),
    region: cognitoSettings.region,
    service,
    sha256: Sha256,
  };
  const signer = new SignatureV4(sigV4Init);
  (signer.sign(httpRequest) as Promise<HttpRequest>).then(signedRequest => {
    obs.next(signedRequest);
    obs.complete();
  });
});