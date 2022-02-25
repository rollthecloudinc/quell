import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { AuthFacade } from 'auth';
import { CognitoSettings } from 'awcog';
import { CrudAdaptorPlugin, CrudOperationResponse, CrudOperationInput, CrudCollectionOperationInput, CrudCollectionOperationResponse } from 'crud';
import { Param, ParamEvaluatorService } from 'dparam';
import { AllConditions, AnyConditions, ConditionProperties } from 'json-rules-engine';
import { firstValueFrom, forkJoin, from, iif, Observable, of } from 'rxjs';
import { catchError, map, switchMap, take, tap } from 'rxjs/operators';
import * as uuid from 'uuid';
import { SignatureV4} from "@aws-sdk/signature-v4";
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

      // This can be moved into crud adaptor call to shared method inside dparams probably.
      switchMap(() => iif(
        () => Object.keys(params).length > 1,
        forkJoin(
          Object.keys(params).map(name => paramsEvaluatorService.paramValue(params[name], new Map<string, any>()).pipe(
            map(v => ({ [name]: v }))
          ))
        ).pipe(
          map(groups => groups.reduce((p, c) => ({ ...p, ...c }), {})), // default options go here instead of empty object.
          map(options => ({ options }))         
        ),
        iif(
          () => Object.keys(params).length !== 0,
          paramsEvaluatorService.paramValue(Object.keys(params).length !== 0 ? params[Object.keys(params)[0]] : new Param(), new Map<string, any>()).pipe(
            map(optionValue => ({ options: { [Object.keys(params)[0]]: optionValue } }))
          ),
          of({ options: {} })
        )
      )),
      // This can be moved into crud adaptor and passed as argument.
      map(({ options }) => ({ options, identityCondition: (rule.conditions as AllConditions).all.map(c => (c as AnyConditions).any.find(c2 => (c2 as ConditionProperties).fact === 'identity')).find(c => !!c) })),

      switchMap(({ identityCondition, options }) => iif(

        () => identityCondition !== undefined && (identityCondition as ConditionProperties).fact === 'identity',

        // This could probably be moved into an aw util module to easily build rest queries for any aw service efficently.
        createS3SignedHttpRequest({
          method: "GET",
          body: undefined,
          headers: {
            "Content-Type": "application/json",
            host: `${(options as any).bucket}.s3.amazonaws.com`,
          },
          hostname: `${(options as any).bucket}.s3.amazonaws.com`,
          path: `${(options as any).prefix}${(identityCondition as ConditionProperties).value}.json`,
          protocol: 'https:',
          service: "s3",
          cognitoSettings: cognitoSettings,
          authFacade: authFacade
        }).pipe(
          tap(() => console.log('.marker({ event: AFTER , entity: s3 , op: query , meta: { action: createSignedRequest } })')),
          tap(signedHttpRequest => delete signedHttpRequest.headers.host),
          map(signedHttpRequest => ({ signedHttpRequest, options, url: `${ isPlatformServer(platformId) ? /*'http://localhost:4000'*/ `${protocol}://${hostName}` /*`https://${options.bucket}.s3.amazonaws.com`*/ : `${protocol}://${hostName}` }${ `/awproxy/s3/${(options as any).bucket}` }${signedHttpRequest.path}` })),
          tap(() => console.log('.marker({ event: BEFORE , entity: crud , op: query , meta: { http: get } })')),
          switchMap(({ signedHttpRequest, url }) => http.get(url, { headers: signedHttpRequest.headers, withCredentials: true })),
          tap(() => console.log('.marker({ event: AFTER , entity: s3 , op: query , meta: { http: get } })')),
          map(res => ({ entities: res ? [ res ] : [], success: res ? true : false }))
        ),

        of({ entities: [], success: false })

      ))
    )
  });
};

// This will no longer be needed once write op sdk usage is replaced by signed url
const buildClient = (authFacade: AuthFacade, cognitoSettings: CognitoSettings) => new S3Client({
  region: cognitoSettings.region,
  credentials: fromCognitoIdentityPool({
    client: new CognitoIdentityClient({ region: cognitoSettings.region }),
    identityPoolId: cognitoSettings.identityPoolId,
    logins: {
      [`cognito-idp.${cognitoSettings.region}.amazonaws.com/${cognitoSettings.userPoolId}`]: () => firstValueFrom(authFacade.getUser$.pipe(map(u => u ? u.id_token : undefined)))
    }
  }),
});

// This should all be moved in either aw util module or awsig module.
// Could also decouple signature from vendor for reuse accross vendors that signed v4 urls can be used.
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

const createS3SignedHttpRequest = ({
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
}: CreateSignHttpRequestParams): Observable<HttpRequest> => of(
  new HttpRequest({
    body,
    headers,
    hostname,
    method,
    path,
    port,
    protocol,
    query,
  }
)).pipe(
  tap(() => console.log('.marker({ event: BEGIN , context: s3, entity: sig , op: signv4 , meta: {  } })')),
  switchMap(req => from(
    (new SignatureV4(
      {
        credentials: fromCognitoIdentityPool({
          client: new CognitoIdentityClient({ region: cognitoSettings.region }),
          identityPoolId: cognitoSettings.identityPoolId,
          logins: {
            [`cognito-idp.${cognitoSettings.region}.amazonaws.com/${cognitoSettings.userPoolId}`]: () => firstValueFrom(authFacade.getUser$.pipe(map(u => u ? u.id_token : undefined)))
          }
        }),
        region: cognitoSettings.region,
        service,
        sha256: Sha256,
      }
    )).sign(req)
      .then(
        signedReq => {
          console.log('.marker({ event: RESOLVED, entity: s3 , op: signv4 , meta: {  } })');
          return signedReq;
        }
      )
  ).pipe(
    tap(() => console.log('.marker({ /s3/sign/after/sig })')),
    take(1)
  )),
  map(req => req as HttpRequest),
  tap(() => console.log('.marker({ event: END , context: s3, entity: sig , op: signv4 , meta: {  } })')),
);
