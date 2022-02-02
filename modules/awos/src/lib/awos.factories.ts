import { AuthFacade } from "auth";
import { CognitoSettings } from "awcog";
import { CrudAdaptorPlugin, CrudCollectionOperationInput, CrudOperationInput, CrudOperationResponse } from "crud";
import { ParamEvaluatorService } from "dparam";
import { forkJoin, Observable, of } from "rxjs";
import { SignatureV4 } from "@aws-sdk/signature-v4";
import { HttpRequest } from "@aws-sdk/protocol-http";
import { Sha256 } from "@aws-crypto/sha256-js";
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { HttpClient } from "@angular/common/http";
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
            // host: 'search-classifieds-ui-dev-eldczuhq3vesgpjnr3vie6cagq.us-east-1.es.amazonaws.com',
            host: `${options.domain}.${options.region}.es.amazonaws.com`,
            // host: hostName
          },
          // hostname: 'search-classifieds-ui-dev-eldczuhq3vesgpjnr3vie6cagq.us-east-1.es.amazonaws.com',
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
        // if (!isPlatformServer(platformId)) {
          delete signedHttpRequest.headers.host;
        // }
        // const url = `${ isPlatformServer(platformId) ? '' : '/opensearch' }${signedHttpRequest.path}`;
        // Te,p disable for mod federation - easier to debug in browser
        const url = `${ isPlatformServer(platformId) ? /*'http://localhost:4000'*/ `${protocol}://${hostName}` : '' }/awproxy/es/${options.domain}/${options.region}${signedHttpRequest.path}`;
        // const url = `${protocol}://${hostName}/awproxy/es/${options.domain}/${options.region}${signedHttpRequest.path}`;
        console.log('url', url);
        return http.post(url, signedHttpRequest.body, { headers: signedHttpRequest.headers, withCredentials: true }).pipe(
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