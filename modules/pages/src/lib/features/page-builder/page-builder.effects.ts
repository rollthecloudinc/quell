import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Actions, createEffect, ofType} from '@ngrx/effects';

import { concatMap, map, catchError, switchMap } from 'rxjs/operators';
import { EMPTY, NEVER, Observable, of } from 'rxjs';
import { JSONPath } from 'jsonpath-plus';

import { Dataset, Rest, DatasourceApiService } from 'datasource';
import * as PageBuilderActions from './page-builder.actions';
import { SnippetParserService } from 'snippet';
/// import { DatasourceApiService } from '../../services/datasource-api.service';


@Injectable()
export class PageBuilderEffects {
  loadRestData$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PageBuilderActions.loadRestData),
      concatMap(p => this.fetchRestdata$(p.rest).pipe(
        catchError(() => {
          return [];
        }),
        map(results => p.rest.renderer !== undefined && p.rest.renderer.query !== undefined && p.rest.renderer.query !== '' ? JSONPath({ path: p.rest.renderer.query, json: results }) : results ),
        map(results => PageBuilderActions.loadRestDataSuccess({ tag: p.tag, data: new Dataset({ results }) }))
      ))
    )
  );
  fetchRestdata$(rest: Rest): Observable<Array<any>> {
    const method = rest.method ? rest.method : 'get';
    switch(method) {
      case 'post':
      case 'POST':
        return of([]).pipe(
          switchMap(() => this.snippetParserService.parseSnippet({ snippet: rest.body })),
          switchMap(body => this.datasourceApi.postData({ url: rest.url, body }))
        );

      default:
        return this.datasourceApi.getData(rest.url);
    }
  }
  constructor(
    private actions$: Actions, 
    private datasourceApi: DatasourceApiService,
    private snippetParserService: SnippetParserService
  ) {}
}
