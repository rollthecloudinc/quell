import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { HttpMethods } from "@ngrx/data";
import { AttributeValue, AttributeSerializerService } from '@rollthecloudinc/attributes';
import { Dataset, DatasourceApiService } from '@rollthecloudinc/datasource';
import { UrlGeneratorService } from '@rollthecloudinc/durl';
import { Observable, of } from "rxjs";
import { catchError, filter, map, switchMap, tap } from "rxjs/operators";
import { SnippetParserService } from '@rollthecloudinc/snippet';
import { Rest } from '../models/rest.models';
import { restfulRequest } from "../rest.factories";

@Injectable()
export class RestFetchHelperService {
  
  constructor(
    private attrbuteSerializer: AttributeSerializerService,
    // private datasourceApi: DatasourceApiService,
    private http: HttpClient,
    private snippetParserService: SnippetParserService,
    private urlGenerator: UrlGeneratorService
  ) {}

  fetchDataset({ settings, metadata }: { settings: Array<AttributeValue>, metadata: Map<string, any> }): Observable<Dataset> {
    return of(new Dataset()).pipe(
      tap(() => console.log('START rest fetch')),
      map(() => this.attrbuteSerializer.deserializeAsObject(settings)),
      map<any, Rest>(s => new Rest(s)),
      switchMap(r => this.urlGenerator.getUrl(r.url, r.params, metadata).pipe(
        map(url => new Rest({ ...r, url }))
      )),
      filter(r => r.url && r.url.trim() !== '' && r.url.indexOf('http') > -1),
      switchMap(r => restfulRequest({ url: r.url, method: r.method.toUpperCase() === 'POST' ? 'POST' : 'GET', http: this.http, params: new Map<string, any>() }).pipe(
        catchError(() => of([])),
        map(data => Array.isArray(data) ? data: [data]),
        // tap(data => this.cache.set(url, data))
        map(results => new Dataset({ results }))
      )),
      tap(() => console.log('END rest fetch'))

      // phase out
      /*switchMap<Rest, Observable<Dataset>>(r => {
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

      })*/

    );
  }

}