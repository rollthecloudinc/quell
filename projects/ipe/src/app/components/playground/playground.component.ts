import { Component, Inject, OnInit } from "@angular/core";
/*import { EntityCollectionService, EntityServices } from "@ngrx/data";
import { AttributeValue } from "attributes";
import { Pane, PanelPage, PanelContentHandler, Panel, PanelsModule } from "panels";
import { forkJoin, iif, Observable, of } from "rxjs";
import { map, switchMap, tap } from "rxjs/operators";*/
import { PanelsSelectorService, PanelsLoaderService } from '@rollthecloudinc/panels';
import { JSONPath } from 'jsonpath-plus';

import { SignatureV4 } from "@aws-sdk/signature-v4";
import { HttpRequest } from "@aws-sdk/protocol-http";
import { Sha256 } from "@aws-crypto/sha256-js";
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { CognitoSettings, COGNITO_SETTINGS } from '@rollthecloudinc/awcog';
import { map, take, tap } from "rxjs/operators";
import { AuthFacade } from "@rollthecloudinc/auth";
import { HttpClient } from "@angular/common/http";
import { AsyncApiCallHelperService } from "@rollthecloudinc/utils";
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
    templateUrl: `playground.component.html`,
    standalone: false
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