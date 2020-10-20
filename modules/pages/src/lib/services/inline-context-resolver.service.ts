import { Injectable } from '@angular/core';
import { InlineContext } from '../models/context.models';
import { ContextManagerService } from 'context';
import { Observable, of, combineLatest, merge, forkJoin} from 'rxjs';
import { map, debounceTime, filter, scan, switchMap } from 'rxjs/operators';
import * as uuid from 'uuid';
import { PageBuilderFacade } from '../features/page-builder/page-builder.facade';

@Injectable({
  providedIn: 'root'
})
export class InlineContextResolverService {

  constructor(
    private contextManager: ContextManagerService,
    private pageBuilderFacade: PageBuilderFacade
  ) {}

  resolveGlobals(tag = uuid.v4()): Observable<any> {
    const plugins = this.contextManager.getAll(true);
    return merge(
      ...plugins.map(p => p.resolver.resolve(p, {}).pipe(
        map(res => [p.name, res])
      ))
    ).pipe(
      scan((acc, [n, v]) => new Map<string, any>([ ...acc, [`_${n}`, v] ]), new Map<string, any>([])),
      filter(v => v.size === plugins.length),
      map(v => Object.assign({}, ...[...v.entries()].map(([k, v]) => ({[k]: v}))))
    );
  }

  resolveGlobalsSingle(tag = uuid.v4()): Observable<any> {
    const plugins = this.contextManager.getAll(true);
    return merge(
      ...plugins.map(p => p.resolver.resolve(p, {}).pipe(
        map(res => [p.name, res])
      ))
    );
  }

  resolveForms(): Observable<any> {
    return this.pageBuilderFacade.getFormNames$.pipe(
      switchMap(names => combineLatest( names.map(n => this.pageBuilderFacade.getForm$(n).pipe(
        map(f => [n, f])
      ) ) )),
      map(v => v.reduce((p, [n, f]) => ({ ...p, [`form__${n}`]: f }), {}))
    );
  }

  resolveFormsSingle(): Observable<any> {
    return this.pageBuilderFacade.getFormNames$.pipe(
      switchMap(names => merge( ...names.map(n => this.pageBuilderFacade.getForm$(n).pipe(
        map(f => [`form__${n}`, f])
      ) ) ))
    );
  }

  resolveAll(contexts: Array<InlineContext>, tag = uuid.v4()): Observable<any>  {
    return merge(
      ...contexts.map(c => this.resolve(c, tag).pipe(
        map(res => [c.name, Array.isArray(res) ? res.length > 0 ? res[0] : undefined : res])
      ))
    ).pipe(
      scan((acc, [n, v]) => new Map<string, any>([ ...acc, [n, v] ]), new Map<string, any>()),
      filter(v => v.size === contexts.length),
      map(v => Object.assign({}, ...[...v.entries()].map(([k, v]) => ({[k]: v}))))
    );
  }

  resolveAllSingle(contexts: Array<InlineContext>, tag = uuid.v4()): Observable<[string, any]> {
    return merge(
      ...contexts.map(c => this.resolve(c, tag).pipe(
        map(res => [c.name, Array.isArray(res) ? res.length > 0 ? res[0] : undefined : res])
      ))
    ).pipe(
      map(([n, v]) => [n, v])
    );
  }

  resolveMerged(contexts: Array<InlineContext>, tag = uuid.v4()): Observable<any> {
    return combineLatest([this.resolveGlobals(tag), this.resolveForms(), contexts.length === 0 ? of({}) : this.resolveAll(contexts, tag)]).pipe(
      debounceTime(0),
      map(v => v.reduce<any>((p, c) => ({ ...p, ...c }), {}))
    );
  }

  resolveMergedSingle(contexts: Array<InlineContext>, tag = uuid.v4()): Observable<any> {
    if(contexts.length !== 0) {
      return merge(
        this.resolveGlobalsSingle(),
        this.resolveFormsSingle(),
        this.resolveAllSingle(contexts)
      );
    } else {
      return merge(
        this.resolveFormsSingle(),
        this.resolveGlobalsSingle()
      )
    }
    /*return merge(
      this.resolveGlobalsSingle(),
      contexts.length === 0 ? of({}) : this.resolveAllSingle(contexts)
    );*/
  }

  resolve(context: InlineContext, tag = uuid.v4()): Observable<any> {
    if(context.plugin) {
      const plugin = this.contextManager.lookupContext(context.plugin);
      return plugin.resolver.resolve(plugin, this.getDataObject(context));
    } else {
      return of(this.getDataObject(context));
    }
  }

  getDataObject(context: InlineContext): any {
    switch(context.adaptor) {
      case 'rest':
        return context.rest;
      case 'snippet':
        return context.snippet;
      case 'json':
        return JSON.parse(context.snippet.content);
      case 'data':
        return context.data;
      case 'token':
        return context.tokens;
      default:
        return undefined;
    }
  }

}
