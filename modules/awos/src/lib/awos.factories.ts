import { AuthFacade } from "auth";
import { CognitoSettings } from "awcog";
import { CrudAdaptorPlugin, CrudCollectionOperationInput, CrudOperationInput, CrudOperationResponse } from "crud";
import { ParamEvaluatorService } from "dparam";
import { firstValueFrom, forkJoin, from, Observable, of } from "rxjs";
import { SignatureV4 } from "@aws-sdk/signature-v4";
import { HttpRequest } from "@aws-sdk/protocol-http";
import { Sha256 } from "@aws-crypto/sha256-js";
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { HttpClient, HttpParams } from "@angular/common/http";
import { map, switchMap, take, tap } from "rxjs/operators";
import { AllConditions, AnyConditions, ConditionProperties } from "json-rules-engine";
import { isPlatformServer } from "@angular/common";

export const opensearchTemplateCrudAdaptorPluginFactory = (platformId: Object, authFacade: AuthFacade, cognitoSettings: CognitoSettings, paramsEvaluatorService: ParamEvaluatorService, http: HttpClient, hostName?: string, protocol?: string) => {
  return new CrudAdaptorPlugin<string>({
    id: 'aws_opensearch_template',
    title: 'AWS Opensearch Template',
    create: ({ object, identity, params }: CrudOperationInput) => of({ success: false }),
    read: ({ }: CrudOperationInput) => of<CrudOperationResponse>({ success: false }),
    update: ({ object, identity, params }: CrudOperationInput) => of({ success: false }),
    delete: ({ }: CrudOperationInput) => of<CrudOperationResponse>({ success: false }),
    query: ({ rule, params }: CrudCollectionOperationInput) => of({ entities: [], success: false }).pipe(
      switchMap( () => params && Object.keys(params).length !== 0 ? forkJoin(Object.keys(params).map(name => paramsEvaluatorService.paramValue(params[name], new Map<string, any>()).pipe(map(v => ({ [name]: v }))))).pipe(
        map(groups => groups.reduce((p, c) => ({ ...p, ...c }), {})), // default options go here instead of empty object.
        map(options => ({ options }))
      ): of({ options: {} })),
      map(({ options }) => ({ options, body: JSON.stringify({ id: options.id, params: rule ? (rule.conditions as AllConditions).all.reduce((p, c) => ({ ...p, ...(c as AnyConditions).any.reduce((p2, c2) => ({ ...p2, [(c2 as ConditionProperties).path.substr(2)]: [ ...( p2[(c2 as ConditionProperties).path.substr(2)] ? p2[(c2 as ConditionProperties).path.substr(2)] : [] ), JSON.parse(decodeURIComponent((c2 as ConditionProperties).value)) ] }), {}) }), {}) : {} }) })),
      tap(({ body }) => console.log('open search template query body', body)),
      switchMap(({ options, body }) => createSignedHttpRequest({
          method: "POST",
          body,
          headers: {
            "Content-Type": "application/json",
            host: `${options.domain}.${options.region}.es.amazonaws.com`,
          },
          hostname: `${options.domain}.${options.region}.es.amazonaws.com`,
          path: `/${options.index}/_search/template`,
          protocol: 'https:',
          service: "es",
          cognitoSettings: cognitoSettings,
          authFacade: authFacade
        }).pipe(
          map(signedHttpRequest => ({ signedHttpRequest, options }))
        )
      ),
      switchMap(( { signedHttpRequest, options }) => {
        delete signedHttpRequest.headers.host;
        const url = `https://${options.domain}.${options.region}.es.amazonaws.com/${options.index}/_search/template`;
        return http.post(url, signedHttpRequest.body, { headers: signedHttpRequest.headers, withCredentials: false }).pipe(
          map(res => ({ res, options }))
        );
      }),
      map(({ res, options }) => ({ entities: options.hits && res && (res as any).hits && ((res as any).hits as any).hits ? ((res as any).hits as any).hits.map(h => options.source ? (h as any)._source : h) : [ res ], success: true })),
    )
  });
};

export const opensearchEntityCrudAdaptorPluginFactory = (authFacade: AuthFacade, cognitoSettings: CognitoSettings, paramsEvaluatorService: ParamEvaluatorService) => {
  return new CrudAdaptorPlugin<string>({
    id: 'aws_opensearch_entity',
    title: 'AWS Opensearch Entity',
    create: ({ object, identity, params }: CrudOperationInput) => of({ success: false }),
    read: ({ }: CrudOperationInput) => of<CrudOperationResponse>({ success: false }),
    update: ({ object, identity, params }: CrudOperationInput) => of({ success: false }),
    delete: ({ }: CrudOperationInput) => of<CrudOperationResponse>({ success: false }),
    query: ({ rule, params }: CrudCollectionOperationInput) => of({ entities: [], success: false })
  });
};

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
  tap(() => console.log('.marker({ event: BEGIN , context: os, entity: sig , op: signv4 , meta: {  } })')),
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
        applyChecksum: false
      }
    )).sign(req)
      .then(
        signedReq => {
          console.log('.marker({ event: RESOLVED, entity: os , op: signv4 , meta: {  } })');
          return signedReq;
        }
      )
  ).pipe(
    tap(() => console.log('.marker({ /os/sign/after/sig })')),
    take(1)
  )),
  map(req => req as HttpRequest),
  tap(() => console.log('.marker({ event: END , context: os, entity: sig , op: signv4 , meta: {  } })')),
);