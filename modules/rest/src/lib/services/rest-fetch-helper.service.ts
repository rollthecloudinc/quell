import { Injectable } from "@angular/core";
import { AttributeValue, AttributeSerializerService } from "attributes";
import { Dataset, DatasourceApiService } from "datasource";
import { UrlGeneratorService } from "durl";
import { Observable, of } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { SnippetParserService } from "snippet";
import { Rest } from '../models/rest.models';

@Injectable()
export class RestFetchHelperService {
  
  constructor(
    private attrbuteSerializer: AttributeSerializerService,
    private datasourceApi: DatasourceApiService,
    private snippetParserService: SnippetParserService,
    private urlGenerator: UrlGeneratorService
  ) {}

  fetchDataset({ settings, metadata }: { settings: Array<AttributeValue>, metadata: Map<string, any> }): Observable<Dataset> {
    return of(new Dataset()).pipe(
      map(() => this.attrbuteSerializer.deserializeAsObject(settings)),
      map<any, Rest>(s => new Rest(s)),
      switchMap(r => this.urlGenerator.getUrl(r.url, r.params, metadata).pipe(
        map(url => new Rest({ ...r, url }))
      )),
      switchMap<Rest, Observable<Dataset>>(r => {
        const method = r.method ? r.method : 'get';
        switch(method) {
          case 'post':
          case 'POST':
            return of([]).pipe(
              switchMap(() => this.snippetParserService.parseSnippet({ snippet: r.body })),
              switchMap(body => this.datasourceApi.postData({ url: r.url, body })),
              map(results => new Dataset({ results }))
            );
    
          default:
            return this.datasourceApi.getData(r.url).pipe(
              map(results => new Dataset({ results }))
            );
        }
      })
    );
  }

}