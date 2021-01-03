import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getSelectors, RouterReducerState } from '@ngrx/router-store';
import { Store, select } from '@ngrx/store';
import { Param } from 'datasource';
import { InlineContext } from 'context';
import { PanelPageForm } from '../models/form.models';
import { Observable, of, forkJoin, iif } from 'rxjs';
import { map, switchMap, defaultIfEmpty, take, tap } from 'rxjs/operators';
import { InlineContextResolverService } from './inline-context-resolver.service';
import { TokenizerService } from 'token';
import { AttributeMatcherService } from 'attributes';
import * as qs from 'qs';
import { PageBuilderFacade } from '../features/page-builder/page-builder.facade';
import { FormService } from './form.service';

@Injectable()
export class UrlGeneratorService {

  constructor(
    private routerStore: Store<RouterReducerState>,
    private inlineContextResolver: InlineContextResolverService,
    private tokenizerService: TokenizerService,
    private pageBuilderFacade: PageBuilderFacade,
    private attributeMatcher: AttributeMatcherService,
    private formService: FormService
  ) {}

  generateUrl(url, params: Array<Param>, metadata: Map<string, any>): Observable<string> {
    const { selectCurrentRoute } = getSelectors((state: any) => state.router);
    return this.routerStore.pipe(
      select(selectCurrentRoute),
      map(route => [route, url, url.indexOf('?')]),
      map(([route, url, index]) => [route, (index > -1 ? url.substring(0, index) : url), (index > -1 ? url.substring(index + 1) : '')]),
      switchMap(([route, path, queryString]) => {
        const qsParsed = qs.parse(queryString);
        const pathPieces: Array<string> = path.split('/');
        const meta = new Map<string, any>([ ...metadata, ['_route', route] ]);
        const paramNames = this.paramNames(url);
        const mappings = params.reduce<Map<string, Param>>((p, c, i) => new Map([ ...p, [paramNames[i], c ] ]), new Map<string, Param>());
        const path$ = pathPieces.reduce<Array<Observable<string>>>((p, c, i) => {
          if(c.indexOf(':') === 0) {
            return [ ...p, this.paramValue(mappings.get(c/*.substr(1)*/), meta)];
          } else {
            return [ ...p, of(pathPieces[i])];
          }
        }, []);
        const qs$: Array<Observable<[string, any, boolean]>> = [];
        for(const prop in qsParsed) {
          if(Array.isArray(qsParsed[prop])) {
            qsParsed[prop].forEach(p => qs$.push(this.paramValue(mappings.get(p), meta).pipe(map(v => [prop, v, true]))));
          } else if(typeof(qsParsed[prop]) === 'string' && qsParsed[prop].indexOf(':') > -1) {
            qs$.push(this.paramValue(mappings.get(qsParsed[prop]/*.substr(1)*/), meta).pipe(map(v => [prop, v, false])));
          } else {
            qs$.push(of([prop, qsParsed[prop], Array.isArray(qsParsed[prop])]));
          }
        }
        return forkJoin([
          forkJoin(path$).pipe(
            map(p => p.join('/')),
            defaultIfEmpty(path)
          ),
          forkJoin(qs$).pipe(
            tap(q => console.log(q)),
            map(q => q.reduce((p, [n, v, m]) => {
              if(v === undefined || v === null || v === '') {
                return p;
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
    const indexPos = url.indexOf('?');
    const pathParsed = ((indexPos > -1 ? url.substring(0, indexPos) : url) as string).split('/').reduce<any>((p, c, i) => (c.indexOf(':') === 0 ? { ...p, [c.substr(1)]: c } : p ), {});
    const parsed = { ...pathParsed, ...qs.parse(url.substring(url.indexOf('?') + 1)) };
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

  paramValue(param: Param, metadata: Map<string, any>): Observable<string> {
    const route = metadata.get('_route') as ActivatedRoute;
    if(param.flags.findIndex(f => f.enabled && f.name === 'page') > -1 && metadata.has('page')) {
      return of(`${metadata.get('page')}`);
    } else if (param.flags.findIndex(f => f.enabled && f.name === 'offset') > -1 && metadata.has('limit') && metadata.has('page')) {
      return of(`${+metadata.get('limit') * (+metadata.get('page') - 1)}`);
    } else if(param.flags.findIndex(f => f.enabled) > -1 && metadata.has('searchString')) {
      return of(`${metadata.get('searchString')}`);
    } else if(param.mapping.type === 'route') {
      return of(route.params[param.mapping.value]);
    } else if(param.mapping.type === 'querystring') {
      return of(route.queryParams[param.mapping.value]);
    } else if(param.mapping.type === 'form') {
      // const [name, value] = param.mapping.value.split('.', 2);
      const name = param.mapping.value.substr(0, param.mapping.value.indexOf('.'));
      const value = param.mapping.value.substr(param.mapping.value.indexOf('.') + 1);
      console.log(`form: ${name} || ${value}`);
      return this.pageBuilderFacade.getForm$(name).pipe(
        take(1),
        map(form => this.formService.serializeForm(form)),
        map(obj => this.tokenizerService.generateGenericTokens(obj)),
        tap(tokens => console.log(tokens)),
        map(tokens => {
          if(!tokens.has(`.${value}`)) {
            return '';
          } else {
            return this.tokenizerService.replaceTokens(`[.${value}]`/*`[.${value}.value]`*/, tokens);
          }
        }),
        tap(value => {
          console.log('form value');
          console.log(value);
        }),
        /*switchMap(form => iif(
          () => form !== undefined,
          new Observable<string>(obs => {
            const formValue = this.formValue(form, value);
            console.log(`form value: ${formValue}`);
            obs.next(formValue);
            obs.complete();
          }).pipe(take(1)),
          of(undefined).pipe(
            take(1)
          )
        ))*/
      );
    } else if(param.mapping.type === 'context') {
      const ctx = new InlineContext(metadata.get('contexts').find(c => c.name === param.mapping.context));
      return this.inlineContextResolver.resolve(ctx).pipe(
        take(1),
        switchMap(d => iif(
          () => param.mapping.value && param.mapping.value !== '',
          of(d).pipe(
            map(d => this.tokenizerService.generateGenericTokens(d[0])),
            map(tokens => this.tokenizerService.replaceTokens(`[${param.mapping.value}]`, tokens)),
            take(1)
          ),
          of(d[0]).pipe(
            take(1)
          )
        ))
      );
    } else {
      return of(param.mapping.value);
    }
  }

  formValue(form: PanelPageForm, value: string): string {
    if(!form) {
      return undefined;
    }
    const len1 = form.panels ? form.panels.length : 0;
    for(let i = 0; i < len1; i++) {
      const len2 = form.panels[i].panes.length;
      for(let j = 0; j < len2; j++) {
        if(form.panels[i].panes[j].name === value && form.panels[i].panes[j].settings && form.panels[i].panes[j].settings.length !== 0) {
          return this.attributeMatcher.getValue('value', form.panels[i].panes[j].settings);
        }
      }
    }
  }

  rebuildQueryString(q: any): any {
    const newQ = {};
    for(const p in q) {
      if(Array.isArray(q[p])) {
        newQ[p] = [];
      } else {
        newQ[p] = p[q];
      }
    }
    return qs.parse(newQ);
  }

}
