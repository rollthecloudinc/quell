import { Injectable } from '@angular/core';
import { Observable, of, combineLatest, merge, forkJoin} from 'rxjs';
import { map, debounceTime, filter, scan, switchMap, defaultIfEmpty, mergeAll } from 'rxjs/operators';
import * as uuid from 'uuid';
import { InlineContext } from '../models/context.models';
import { ContextManagerService } from './context-manager.service';
import { ContextPluginManager } from './context-plugin-manager.service';
import { ResolvedContextPluginManager } from './resolved-context-plugin-manager.service';

// import { PageBuilderFacade } from '../features/page-builder/page-builder.facade';

export abstract class BaseInlineContextResolverService {

  constructor(
    // private contextManager: ContextManagerService,
    // private pageBuilderFacade: PageBuilderFacade,
    private cpm: ContextPluginManager,
    private rcm: ResolvedContextPluginManager
  ) {}

  resolveGlobals(tag = uuid.v4()): Observable<any> {
    // const plugins = this.contextManager.getAll(true);

    return this.cpm.getPlugins().pipe(
      map(plugins => Array.from(plugins.values()).filter(p => p.global === true)),
      switchMap(plugins =>
        merge(
          ...plugins.map(p => p.resolver.resolve(p, {}).pipe(
            map(res => [p.name, res, plugins.length])
          ))
        ).pipe(
          scan((acc, [n, v, len]) => new Map<string, any>([ ...acc, [`_${n}`, v], ['__len', len] ],), new Map<string, any>([])),
          filter(v => v.size - 1 === +v.get('__len')),
          map(v => Object.assign({}, ...[...v.entries()].filter(([k, v]) => k !== '__len').map(([k, v]) => ({[k]: v}))))
        )
      )
    );

    /*return this.cpm.getPlugins().pipe(
      map(plugins => Array.from(plugins.values()).filter(p => p.global === true)),
      map(plugins => plugins.map((p, k) => p => p.resolver.resolve(p, {}).pipe(
        map<any, [string, any, number]>(res => [p.name, res, plugins.length])
      ))),
      mergeAll(),
      scan((acc, [n, v, len]) => new Map<string, any>([ ...acc, [`_${n}`, v], ['__len', len] ],), new Map<string, any>([])),
      filter(v => v.size - 1 === v.get('__len').len),
      map(v => Object.assign({}, ...[...v.entries()].filter(([k, v]) => k !== '__len').map(([k, v]) => ({[k]: v}))))
    );*/

    /*return merge(
      ...plugins.map(p => p.resolver.resolve(p, {}).pipe(
        map(res => [p.name, res])
      ))
    ).pipe(
      scan((acc, [n, v]) => new Map<string, any>([ ...acc, [`_${n}`, v] ]), new Map<string, any>([])),
      filter(v => v.size === plugins.length),
      map(v => Object.assign({}, ...[...v.entries()].map(([k, v]) => ({[k]: v}))))
    );*/
  }

  resolveGlobalsSingle(tag = uuid.v4()): Observable<any> {
    // const plugins = this.contextManager.getAll(true);

    return this.cpm.getPlugins().pipe(
      map(plugins => Array.from(plugins.values()).filter(p => p.global === true)),
      switchMap(plugins => merge(
        ...plugins.map(p => p.resolver.resolve(p, {}).pipe(
          map(res => [p.name, res])
        ))
      ))
    );

    /*return merge(
      ...plugins.map(p => p.resolver.resolve(p, {}).pipe(
        map(res => [p.name, res])
      ))
    );*/
  }

  /*resolveForms(): Observable<any> {
    return this.pageBuilderFacade.getFormNames$.pipe(
      switchMap(names => names.length === 0 ? of([]) : combineLatest( names.map(n => this.pageBuilderFacade.getForm$(n).pipe(
        map(f => [n, f])
      ) ) )),
      map(v => v.reduce((p, [n, f]) => ({ ...p, [`form__${n}`]: f }), {}))
    );
  }*/

  /*resolveFormsSingle(): Observable<any> {
    return this.pageBuilderFacade.getFormNames$.pipe(
      switchMap(names => merge( ...names.map(n => this.pageBuilderFacade.getForm$(n).pipe(
        map(f => [`form__${n}`, f])
      ) ) ))
    );
  }*/

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
    /*return combineLatest([this.resolveGlobals(tag), this.resolveForms(), contexts.length === 0 ? of({}) : this.resolveAll(contexts, tag)]).pipe(
      debounceTime(0),
      map(v => v.reduce<any>((p, c) => ({ ...p, ...c }), {}))
    );*/
    return this.rcm.getPlugins().pipe(
      switchMap(() => this.rcm.add$.pipe(
        defaultIfEmpty()
      )),
      switchMap(() => this.rcm.getPlugins()),
      switchMap(plugins => combineLatest([
        ...Array.from(plugins).map(([_, p]) => p.resolve()),
        this.resolveGlobals(tag),
        contexts.length === 0 ? of({}) : this.resolveAll(contexts, tag)
      ]).pipe(
        debounceTime(0),
        map(v => v.reduce<any>((p, c) => ({ ...p, ...c }), {})) 
      ))
    );
  }

  resolveMergedSingle(contexts: Array<InlineContext>, tag = uuid.v4()): Observable<any> {
    if(contexts.length !== 0) {
      /*return merge(
        this.resolveGlobalsSingle(),
        // this.resolveFormsSingle(),
        this.resolveAllSingle(contexts)
      );*/
      return this.rcm.getPlugins().pipe(
        /*switchMap(() => this.rcm.add$.pipe(
          defaultIfEmpty()
        )),
        switchMap(() => this.rcm.getPlugins()),*/
        switchMap(plugins => merge(
          ...Array.from(plugins).map(([_, p]) => p.resolveSingle()),
          // Turn this into plugins as well
          this.resolveGlobalsSingle(),
          this.resolveAllSingle(contexts),
        ))
      );
    } else {
      /*return merge(
        // this.resolveFormsSingle(),
        this.resolveGlobalsSingle()
      );*/
      //return this.resolveGlobalsSingle();
      return this.rcm.getPlugins().pipe(
        /*switchMap(() => this.rcm.add$.pipe(
          defaultIfEmpty()
        )),
        switchMap(() => this.rcm.getPlugins()),*/
        switchMap(plugins => merge(
          ...Array.from(plugins).map(([_, p]) => p.resolveSingle()),
          this.resolveGlobalsSingle()
        ))
      );
    }
    /*return merge(
      this.resolveGlobalsSingle(),
      contexts.length === 0 ? of({}) : this.resolveAllSingle(contexts)
    );*/
  }

  resolve(context: InlineContext, tag = uuid.v4()): Observable<any> {
    if(context.plugin) {
      return this.cpm.getPlugin(context.plugin).pipe(
        /*switchMap(p => p.beforeResolve({ inlineContext: context }).pipe(
          map(({ inlineContext }) => ({ inlineContext, plugin: p }))
        )),*/
        // switchMap(p => p.resolver.resolve(p, this.getDataObject(context)))
        switchMap(p => p.resolver.resolve(p, this.getDataObject(context), new Map<string, any>([ [ 'name', context.name ] ])))
      );
      /*const plugin = this.contextManager.lookupContext(context.plugin);
      return plugin.resolver.resolve(plugin, this.getDataObject(context));*/
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
