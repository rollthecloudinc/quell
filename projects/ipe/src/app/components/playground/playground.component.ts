import { Component, Inject, OnInit } from "@angular/core";
/*import { EntityCollectionService, EntityServices } from "@ngrx/data";
import { AttributeValue } from "attributes";
import { Pane, PanelPage, PanelContentHandler, Panel, PanelsModule } from "panels";
import { forkJoin, iif, Observable, of } from "rxjs";
import { map, switchMap, tap } from "rxjs/operators";*/
import { PanelsSelectorService, PanelsLoaderService } from 'panels';
import { JSONPath } from 'jsonpath-plus';

import { SignatureV4 } from "@aws-sdk/signature-v4";
import { HttpRequest } from "@aws-sdk/protocol-http";
import { Sha256 } from "@aws-crypto/sha256-js";
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { CognitoSettings, COGNITO_SETTINGS } from 'awcog';
import { map, take, tap } from "rxjs/operators";
import { AuthFacade } from "auth";
import { HttpClient } from "@angular/common/http";
import { AsyncApiCallHelperService } from "utils";
// import { NodeHttpHandler } from "@aws-sdk/node-http-handler";
// import { Client } from '@elastic/elasticsearch'
// import { createAWSConnection, awsGetCredentials } from '@acuris/aws-es-connection';

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

export async function createSignedHttpRequest({
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
}: CreateSignHttpRequestParams): Promise<HttpRequest> {
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
  return signer.sign(httpRequest) as Promise<HttpRequest>;
};

@Component({
  selector: "druid-playground",
  templateUrl: `playground.component.html`
})
export class PlaygroundComponent implements OnInit {

  hits: Array<any> = [];

  /*get panelPageService(): EntityCollectionService<PanelPage> {
    return this.es.getEntityCollectionService('PanelPage');
  }*/
  constructor(
    // private es: EntityServices,
    // private panelHandler: PanelContentHandler
    private panelsLoaderService: PanelsLoaderService,
    private panelsSelectorService: PanelsSelectorService,
    @Inject(COGNITO_SETTINGS) private cognitoSettings: CognitoSettings,
    private authFacade: AuthFacade,
    private http: HttpClient,
    private asyncApiCallHelperSvc: AsyncApiCallHelperService
  ) {
  }
  ngOnInit() {
    /*this.getByKey('183fbb6c-4fc7-11eb-a003-aa11747f279e').subscribe(p => {
      console.log(p);
      const result = JSONPath({ path: '$.panels[0].panes[0].nestedPage.panels[0].panes[0]', json: p });
      // select nested page
      // rebuild without other panels and without target - 2 separate.
      console.log(result);
      console.log(this.rebuildPage(p, [ 0, 0, 0, -1 ]));
      console.log(this.rebuildPage(p, [ 1, 1, 1, 1 ]));
    });*/
    /*this.panelsLoaderService.getByKey('183fbb6c-4fc7-11eb-a003-aa11747f279e').subscribe(p => {
      console.log(p);
      const result = JSONPath({ path: '$.panels[0].panes[0].nestedPage.panels[0].panes[0]', json: p });
      // select nested page
      // rebuild without other panels and without target - 2 separate.
      console.log(result);
      console.log(this.panelsSelectorService.rebuildPage(p, [ 0, 0, 0, -1 ]));
      console.log(this.panelsSelectorService.rebuildPage(p, [ 1, 1, 1, 1 ]));
    });*/

    // const nodeHttpHandler = new NodeHttpHandler();
    const body = JSON.stringify({
      query: {
        match_all: {}
      },
    });
    const hostname =
      // "search-classifieds-ui-dev-eldczuhq3vesgpjnr3vie6cagq.us-east-1.es.amazonaws.com";
      // "620rzauxne.execute-api.us-east-1.amazonaws.com";
      "search-classifieds-ui-dev-eldczuhq3vesgpjnr3vie6cagq.us-east-1.es.amazonaws.com";
    this.asyncApiCallHelperSvc.doTask(new Promise((resolve, reject) => {
      createSignedHttpRequest({
        method: "POST",
        body,
        headers: {
          "Content-Type": "application/json",
          host: hostname,
          // authority: "classifieds-ui-dev.auth.us-east-1.amazoncognito.com",
          // "Origin": "http://localhost:4200",
          // "Access-Control-Allow-Origin": "*",
          // "Access-Control-Allow-Headers": "*",
          // "Access-Control-Allow-Methods": "*"
        },
        hostname,
        path: '/classified_ads/_search',
        // port: 4000,
        protocol: 'https:',
        service: "es",
        cognitoSettings: this.cognitoSettings,
        authFacade: this.authFacade
      }).then(signedHttpRequest => {
        console.log('signedHttpRequest', signedHttpRequest);
        // return nodeHttpHandler.handle(signedHttpRequest).then();
        delete signedHttpRequest.headers.host;
        const url = `/opensearch${signedHttpRequest.path}`;
        console.log('url', url);
        this.http.post(url, signedHttpRequest.body, { headers: signedHttpRequest.headers, withCredentials: true }).pipe(
          tap(res => resolve(res))
        ).subscribe(res => {
          this.hits = (res as any).hits.hits.map(h => h._source);
          setTimeout(() => resolve(res));
        });
        return ''; //this.http.request(signedHttpRequest);
      });
    })).pipe(
      tap(res => console.log('completed request', res))
    );

  }
  /*reducePage(pp: PanelPage): Array<Observable<[number, number, PanelPage]>> {
    return pp.panels.reduce((p, c, i) => this.reducePanels(p, c, i), []);
  }
  reducePanels(p: Array<Observable<[number, number, PanelPage]>>, c: Panel, i: number): Array<Observable<[number, number, PanelPage]>> {
    return [ ...p, ...c.panes.reduce((p2, c2, i2) => this.reducePanes(p2, c2, i2).map(o => o.pipe(map(([i3, pp]) => [i, i3, pp]))), []) ];
  }
  reducePanes(p: Array<Observable<[number, PanelPage]>>, c: Pane, i: number): Array<Observable<[number, PanelPage]>> {
    return [ 
      ...p,
      ...(
        c.contentPlugin === 'panel' ? 
        [
          this.nestedPage$(c).pipe(
            map(pp => [i, pp])
          )
        ] : 
        []
      ) 
    ] as Array<Observable<[number, PanelPage]>>;
  }
  nestedPage$(p: Pane): Observable<PanelPage> {
    console.log('get nested panel page');
    return p.linkedPageId && p.linkedPageId !== '' ? this.getByKey(p.linkedPageId).pipe(tap(() => console.log(`get(${p.linkedPageId})`))) : this.getEmbedded(p.settings).pipe(tap(() => console.log('toObject()')));
  }
  remapNested(p: PanelPage, nested: Array<[number, number, PanelPage]>): void {
    nested.forEach(([index1, index2, np]) => {
      p.panels[index1].panes[index2].nestedPage = np;
    });
  }
  getByKey(key: string): Observable<PanelPage> {
    return this.panelPageService.getByKey(key).pipe(
      map(p => new PanelPage(p)),
      switchMap(p => iif(
        () => this.reducePage(p).length > 0,
        forkJoin(this.reducePage(p)).pipe(
          tap(nested => this.remapNested(p, nested)),
          map(() => p)
        ),
        of(p)
      ))
    );
  }
  getEmbedded(settings: Array<AttributeValue>): Observable<PanelPage> {
    return this.panelHandler.toObject(settings).pipe(
      map<PanelPage, PanelPage>(p => new PanelPage(p)),
      switchMap(p => iif<PanelPage, PanelPage>(
        () => this.reducePage(p as PanelPage).length > 0,
        forkJoin(this.reducePage(p as PanelPage)).pipe(
          tap(nested => this.remapNested(p as PanelPage, nested)),
          map(() => p)
        ),
        of(p)
      ))
    );
  }*/

  // selector trials

  /*rebuildPage(panelPage: PanelPage, path: Array<number>): PanelPage {
    return new PanelPage({ ...panelPage, panels: this.rebuildPanels(panelPage.panels, [ ...path ]) });
  }

  rebuildPanels(panels: Array<Panel>, path: Array<number>): Array<Panel> {
    return panels.filter((_, i) => this.rebuildCondition(path[0], i)).map(p => new Panel({ ...p, panes: this.rebuildPanes(p.panes, path.slice(1)) }));
  }

  rebuildPanes(panes: Array<Pane>, path: Array<number>): Array<Pane> {
    return panes.filter((_, i) => this.rebuildCondition(path[0], i)).map(p => p.contentPlugin === 'panel' ? new Pane({ ...p, nestedPage: undefined, settings: this.panelHandler.buildSettings(this.rebuildPage(p.nestedPage, path.slice(1))) }) : new Pane({ ...p }));
  }

  rebuildCondition(s: number, i: number): boolean {
    return s !== 0 ? s > -1 ? i === (s + (s * -1)) : i !== ((s* -1) + s) : true;
  }*/

}