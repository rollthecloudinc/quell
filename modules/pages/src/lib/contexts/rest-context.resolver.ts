import { Injectable } from '@angular/core';
import { ContextResolver, ContextPlugin } from 'context';
import { InlineContext } from 'context';
import { PageBuilderPartialState } from '../features/page-builder/page-builder.reducer';
import { Store, select } from '@ngrx/store';
import { Observable, Subject, of, merge } from 'rxjs';
import { filter, take, switchMap, tap, map } from 'rxjs/operators';
import { UrlGeneratorService } from 'durl';
import { Rest } from 'datasource';
import { Param } from 'dparam'
import { selectDataset, selectPageInfo } from '../features/page-builder/page-builder.selectors';
import { PageBuilderFacade } from '../features/page-builder/page-builder.facade';
import * as uuid from 'uuid';
import { getSelectors, RouterReducerState } from '@ngrx/router-store';

@Injectable()
export class RestContextResolver implements ContextResolver {

  constructor(
    private pageBuilderFacade: PageBuilderFacade,
    private store: Store<PageBuilderPartialState>,
    private urlGeneratorService: UrlGeneratorService,
    private routerStore: Store<RouterReducerState>
  ) { }

  resolve(context: ContextPlugin, data?: any): Observable<any> {
    const rest = new Rest(data);
    return this.changePipeline(rest.params).pipe(
      switchMap(() => this.rebuildParams(rest.params)),
      map<Array<Param>, [Array<Param>, Map<string, any>]>(params => [params, new Map<string, any>([ [ 'tag', uuid.v4() ] ])]),
      switchMap(([params, metadata]) => this.urlGeneratorService.getUrl(rest.url, params, metadata).pipe(
        map<string, [string, Map<string, any>]>(url => [url, metadata])
      )),
      switchMap(([url, metadata]) => {
        this.pageBuilderFacade.loadRestData(`${metadata.get('tag')}`, new Rest({ ...rest, url }));
        return this.store.pipe(
          select(selectDataset(`${metadata.get('tag')}`)),
          filter(dataset => dataset !== undefined),
          map(dataset => dataset.results),
          take(1)
        );
      })
    );
    /*this.urlGeneratorService.generateUrl(rest.url, rest.params, metadata).subscribe(url => {
      this.store.pipe(
        select(selectDataset(`${metadata.get('tag')}`)),
        filter(dataset => dataset !== undefined),
        take(1)
      ).subscribe(dataset => {
        subject.next(dataset.results);
        subject.complete();
      });
      this.pageBuilderFacade.loadRestData(`${metadata.get('tag')}`, new Rest({ ...rest, url }));
    });*/
    //return subject;
  }

  changePipeline(params: Array<Param>): Observable<undefined> {
    const pipeline = params.reduce<Array<Observable<undefined>>>((p, c) => {
      switch(c.mapping.type) {
        case 'route':
          return [ ...p, this.routeArgChange(c.mapping.value) ];
        case 'querystring':
          return [ ...p, this.queryStringChange(c.mapping.value) ];
        case 'form':
            return [ ...p, this.formChange(c.mapping.value) ];
        default:
          return [ ...p ];
      }
    }, []);
    return merge(...pipeline);
  }

  routeArgChange(arg: string): Observable<undefined> {
    //const sub = new Subject<undefined>();
    //return sub;
    return this.pageBuilderFacade.getPageInfo$.pipe(
      map(() => undefined)
    );
    /*const { selectCurrentRoute } = getSelectors((state: any) => state.router);
    return this.routerStore.pipe(
      select(selectCurrentRoute),
      map(() => undefined)
    );*/
  }

  queryStringChange(name: string): Observable<undefined> {
    const sub = new Subject<undefined>();
    return sub;
  }

  formChange(query: string): Observable<undefined> {
    const [name, value] = query.split('.', 2);
    return this.pageBuilderFacade.getForm$(name).pipe(tap(() => console.log('form change')), map(() => undefined));
  }

  rebuildParams(params: Array<Param>): Observable<Array<Param>> {
    return this.pageBuilderFacade.getPageInfo$.pipe(
      map(pageInfo => pageInfo ? params : this.testParams(params))
    );
  }

  testParams(params: Array<Param>): Array<Param> {
    const newParams = [];
    const len = params.length;
    for(let i = 0; i < len; i++) {
      if(params[i].mapping.type === 'route') {
        newParams.push(new Param({ ...params[i], mapping: { type: 'static', value: params[i].mapping.testValue, context: undefined, testValue: undefined } }));
      } else {
        newParams.push(new Param(params[i]));
      }
    }
    return newParams;
  }

}
