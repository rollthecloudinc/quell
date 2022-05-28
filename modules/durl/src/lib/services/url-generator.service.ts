import { Injectable } from '@angular/core';
import { getSelectors, RouterReducerState } from '@ngrx/router-store';
import { Store, select } from '@ngrx/store';
import { Param, ParamPluginManager, ParamEvaluatorService } from '@ng-druid/dparam';
import { Observable, of, forkJoin } from 'rxjs';
import { map, switchMap, defaultIfEmpty, tap, } from 'rxjs/operators';
import * as qs from 'qs';
@Injectable({
  providedIn: 'root'
})
export class UrlGeneratorService {

  constructor(
    private routerStore: Store<RouterReducerState>,
    private paramPluginManager: ParamPluginManager,
    private paramEvaluatorService: ParamEvaluatorService
  ) {}

  getUrl(url, params: Array<Param>, metadata: Map<string, any>): Observable<string> {
    const { selectCurrentRoute } = getSelectors((state: any) => state.router);
    return this.routerStore.pipe(
      select(selectCurrentRoute),
      map(route => [route, url, url ? url.indexOf('?') : -1]),
      map(([route, url, index]) => [route, (index > -1 ? url.substring(0, index) : url), (index > -1 ? url.substring(index + 1) : '')]),
      switchMap(([route, path, queryString]) => {
        const qsParsed = qs.parse(queryString);
        const pathPieces: Array<string> = path ? path.split('/') : [];
        const meta = new Map<string, any>([ ...metadata, ['_route', route] ]);
        const paramNames = this.paramNames(url);
        const mappings = params.reduce<Map<string, Param>>((p, c, i) => new Map([ ...p, [paramNames[i], c ] ]), new Map<string, Param>());
        const path$ = pathPieces.reduce<Array<Observable<string>>>((p, c, i) => {
          if(c.indexOf(':') === 0) {
            return [ ...p, this.paramEvaluatorService.paramValue(mappings.get(c/*.substr(1)*/), meta)];
          } else {
            return [ ...p, of(pathPieces[i])];
          }
        }, []);
        const qs$: Array<Observable<[string, any, boolean]>> = [];
        for(const prop in qsParsed) {
          if(Array.isArray(qsParsed[prop])) {
            (qsParsed[prop] as Array<any>).forEach(p => qs$.push(this.paramEvaluatorService.paramValue(mappings.get(p), meta).pipe(map(v => [prop, v, true]))));
          } else if(typeof(qsParsed[prop]) === 'string' && (qsParsed[prop] as string).indexOf(':') > -1) {
            qs$.push(this.paramEvaluatorService.paramValue(mappings.get((qsParsed[prop] as string)/*.substr(1)*/), meta).pipe(map(v => [prop, v, false])));
          } else {
            qs$.push(of([prop, qsParsed[prop], Array.isArray(qsParsed[prop])]));
          }
        }
        return forkJoin([
          forkJoin(path$).pipe(
            map(p => p.filter(v => v !== undefined && v !== null && v !== '' && v !== 'undefined').map((v, index) => index === 0 && v.indexOf('http') === 0 ? `${v}/` : v).join('/')),
            defaultIfEmpty(path)
          ),
          forkJoin(qs$).pipe(
            tap(q => console.log(q)),
            map(q => q.reduce((p, [n, v, m]) => {
              if(v === undefined || v === null || v === '' || v === 'undefined') {
                const p2 = { ...p };
                delete p2[n];
                return p2;
              } else {
                return ( m ? { ...p, [n]: [ ...( p[n] !== undefined ? p[n] : [] ) , v ] } : { ...p, [n]: v } );
              }
            }, this.rebuildQueryString(qsParsed))),
            tap(q => console.log(q)),
            map(q => qs.stringify(q, { arrayFormat: 'repeat', indices: false })),
            defaultIfEmpty(queryString)
          )
        ]).pipe(
          map(r => r.join('?')),
        );
      })
    );
  }

  paramNames(url: string): Array<string> {
    const indexPos = url ? url.indexOf('?') : -1;
    const pathParsed = ((indexPos > -1 ? url.substring(0, indexPos) : url ? url : '') as string).split('/').reduce<any>((p, c, i) => (c.indexOf(':') === 0 ? { ...p, [c.substr(1)]: c } : p ), {});
    const parsed = { ...pathParsed, ...qs.parse(url ? url.substring(url.indexOf('?') + 1) : '') };
    const paramNames = [];
    for(const param in parsed) {
      if(Array.isArray(parsed[param])) {
        parsed[param].forEach(p => paramNames.push(p));
      } else if(parsed[param].indexOf(':') === 0) {
        paramNames.push(parsed[param]);
      }
    }
    return paramNames;
  }

  rebuildQueryString(q: any): any {
    const newQ = {};
    for(const p in q) {
      if(Array.isArray(q[p])) {
        newQ[p] = [];
      } else if (p[q] !== undefined && p[q] !== null && p[q] !== '' && p[q] !== 'undefined') {
        newQ[p] = p[q];
      }
    }
    return qs.parse(newQ);
  }

}