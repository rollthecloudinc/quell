import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { AuthFacade } from '@ng-druid/auth';
import { CognitoSettings } from '@ng-druid/awcog';
import { CrudAdaptorPlugin, CrudOperationResponse, CrudOperationInput, CrudCollectionOperationInput, CrudCollectionOperationResponse } from '@ng-druid/crud';
import { Param, ParamEvaluatorService } from '@ng-druid/dparam';
import { AllConditions, AnyConditions, ConditionProperties } from 'json-rules-engine';
import { firstValueFrom, forkJoin, from, iif, Observable, of } from 'rxjs';
import { catchError, map, switchMap, take, tap } from 'rxjs/operators';
import * as uuid from 'uuid';
import { SignatureV4} from "@aws-sdk/signature-v4";
import { HttpRequest } from "@aws-sdk/protocol-http";
import { Sha256 } from "@aws-crypto/sha256-js";
import { HttpClient } from '@angular/common/http';
import { isPlatformServer } from '@angular/common';
import { AsyncApiCallHelperService } from '@ng-druid/utils';

export const s3EntityCrudAdaptorPluginFactory = (platformId: Object, authFacade: AuthFacade, cognitoSettings: CognitoSettings, paramsEvaluatorService: ParamEvaluatorService, http: HttpClient, asyncApiCallHelperSvc: AsyncApiCallHelperService) => {
  return new CrudAdaptorPlugin<string>({
    id: 'aws_s3_entity',
    title: 'AWS S3 Entity',
    create: ({ object, identity, params, parentObject }: CrudOperationInput) => of({ success: false }).pipe(
      paramsEvaluatorService.resolveParams({ params }),
      switchMap(({ options }) => identity({ object, parentObject }).pipe(
        map(({ identity }) => ({ identity, options })),
      )),
      switchMap(({ options, identity }) => createS3SignedHttpRequest({
        method: "PUT",
        body: JSON.stringify(object),
        headers: {
          "Content-Type": "application/json",
          host: `${(options as any).bucket}.s3.amazonaws.com`,
        },
        hostname: `${(options as any).bucket}.s3.amazonaws.com`,
        path: `${(options as any).prefix}${identity}.json`,
        protocol: 'https:',
        service: "s3",
        cognitoSettings: cognitoSettings,
        authFacade: authFacade
      }).pipe(
        map(signedHttpRequest => ({ signedHttpRequest, options }))
      )),
      tap(({ signedHttpRequest }) => delete signedHttpRequest.headers.host),
      map(({ signedHttpRequest, options }) => ({ signedHttpRequest, options, url: `https://${(options as any).bucket}.s3.amazonaws.com${signedHttpRequest.path}` })),
      switchMap(({ signedHttpRequest, url }) => http.put(url, JSON.stringify(object), { headers: signedHttpRequest.headers, withCredentials: false })),
      map(() => ({ success: true }))
    ),
    read: ({ }: CrudOperationInput) => of<CrudOperationResponse>({ success: false }),
    update: ({ object, identity, params }: CrudOperationInput) => of({ success: false }).pipe(
      paramsEvaluatorService.resolveParams({ params }),
      switchMap(({ options }) => identity({ object }).pipe(
        map(({ identity }) => ({ identity, options })),
      )),
      switchMap(({ options, identity }) => createS3SignedHttpRequest({
        method: "PUT",
        body: JSON.stringify(object),
        headers: {
          "Content-Type": "application/json",
          host: `${(options as any).bucket}.s3.amazonaws.com`,
        },
        hostname: `${(options as any).bucket}.s3.amazonaws.com`,
        path: `${(options as any).prefix}${identity}.json`,
        protocol: 'https:',
        service: "s3",
        cognitoSettings: cognitoSettings,
        authFacade: authFacade
      }).pipe(
        map(signedHttpRequest => ({ signedHttpRequest, options }))
      )),
      tap(({ signedHttpRequest }) => delete signedHttpRequest.headers.host),
      map(({ signedHttpRequest, options }) => ({ signedHttpRequest, options, url: `https://${(options as any).bucket}.s3.amazonaws.com${signedHttpRequest.path}` })),
      switchMap(({ signedHttpRequest, url }) => http.put(url, JSON.stringify(object), { headers: signedHttpRequest.headers, withCredentials: false })),
      map(() => ({ success: true }))
    ),
    delete: ({ }: CrudOperationInput) => of<CrudOperationResponse>({ success: false }),
    query: ({ rule, params }: CrudCollectionOperationInput) => of({ entities: [], success: false }).pipe(

      paramsEvaluatorService.resolveParams({ params }),

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
          // map(signedHttpRequest => ({ signedHttpRequest, options, url: `${ isPlatformServer(platformId) ? /*'http://localhost:4000'*/ `${protocol}://${hostName}` /*`https://${options.bucket}.s3.amazonaws.com`*/ : `${protocol}://${hostName}` }${ `/awproxy/s3/${(options as any).bucket}` }${signedHttpRequest.path}` })),
          map(signedHttpRequest => ({ signedHttpRequest, options, url: `https://${(options as any).bucket}.s3.amazonaws.com${signedHttpRequest.path}` })),
          tap(() => console.log('.marker({ event: BEFORE , entity: crud , op: query , meta: { http: get } })')),
          switchMap(({ signedHttpRequest, url }) => http.get(url, { headers: signedHttpRequest.headers, withCredentials: false })),
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
