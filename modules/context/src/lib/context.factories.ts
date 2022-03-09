import { ContextDatasource, ContextPlugin, InlineContext } from './models/context.models';
import { RouteResolver } from './resolvers/route.resolver';
import { BridgeBuilderPlugin, PublicApiBridgeService } from 'bridge';
import { ContextPluginManager } from './services/context-plugin-manager.service';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { ParamPlugin, Param } from 'dparam';
import { iif, of } from 'rxjs';
import { InlineContextResolverService } from './services/inline-context-resolver.service';
import { TokenizerService } from 'token';
import { Dataset, DatasourcePlugin } from 'datasource';
import { ContextDatasourceComponent } from './components/context-datasource/context-datasource.component';
import { AttributeSerializerService, AttributeValue } from '@ng-druid/attributes';
import { ContentBinding } from 'content';
import { DatasourceResolver } from './resolvers/datasource.resolver';
import { DatasourceContextEditorComponent } from './components/datasource-context-editor/datasource-context-editor.component';

export const routeContextFactory = (resolver: RouteResolver) => {
  const baseObject = {
    path: '',
    arg0: '',
    arg2: '',
    arg3: '',
    arg4: '',
    arg5: ''
  };
  return new ContextPlugin<string>({ id: 'route', name: 'route', title: 'Route', global: true, baseObject, resolver });
};

export const contextBridgeFactory = (cpm: ContextPluginManager, inlineContextResolver: InlineContextResolverService) => {
  return new BridgeBuilderPlugin<string>({
    id: 'context',
    title: 'Context',
    build: () => {
      PublicApiBridgeService.prototype['resolveContext'] = (n: string, data?: any): Promise<any> => {
        return new Promise(res => {
          cpm.getPlugin(n).pipe(
            switchMap(p => p.resolver.resolve(p, data).pipe(
              take(1)
            ))
          ).subscribe(result => {
            res(result);
          });
        });
      }
      PublicApiBridgeService.prototype['resolveMergedContext'] = (contexts: Array<InlineContext>): Promise<any> => {
        return new Promise(res => {
          inlineContextResolver.resolveMerged(contexts).pipe(
            tap(v => res(v)),
            take(1),
          ).subscribe();
        });
      };
    }
  }); 
};

export const paramPluginFactory = (
  inlineContextResolver: InlineContextResolverService,
  tokenizerService: TokenizerService
) => {
  return new ParamPlugin<string>({ 
    id: 'context',
    title: 'Context',
    evalParam: ({ param, metadata }: { param: Param, metadata: Map<string, any> })  => {
      const ctx = param.mapping.context && param.mapping.context !== '' ? new InlineContext(metadata.get('contexts').find(c => c.name === param.mapping.context)) : undefined;
      return ctx ? inlineContextResolver.resolve(ctx).pipe(
        take(1),
        switchMap(d => iif(
          () => param.mapping.value && param.mapping.value !== '',
          of(d).pipe(
            map(d => tokenizerService.generateGenericTokens(Array.isArray(d) ? d[0] : d)),
            map(tokens => tokenizerService.replaceTokens(`[${param.mapping.value}]`, tokens)),
            take(1)
          ),
          of(Array.isArray(d) ? d[0] : d)).pipe(
            take(1)
          )
        )
      ) : of();
    },
    // At the very least it uses itself, right?
    usedContexts: ({ param, metadata }: { param: Param, metadata: Map<string, any> }) => of([ param.mapping.context ])
  });
}

export const contextDatasourceFactory = (
  inlineContextResolver: InlineContextResolverService,
  attributeSerializer: AttributeSerializerService
) => {
  return new DatasourcePlugin<string>({
    id: 'context',
    title: 'Context',
    editor: ContextDatasourceComponent,
    fetch: ({ settings, metadata }: { settings: Array<AttributeValue>, metadata: Map<string, any> }) => of(new Dataset()).pipe(
      map(() => new ContextDatasource(attributeSerializer.deserializeAsObject(settings))),
      map(ds => (metadata.get('contexts') as Array<InlineContext>).find(c => c.name === ds.name)),
      switchMap(inlineContext => inlineContextResolver.resolve(inlineContext).pipe(
        map(v => v instanceof Dataset ? v : new Dataset({ results: Array.isArray(v) ? v : [v] })),
        take(1)
      ))
    ),
    getBindings: ({ settings, metadata }: { settings: Array<AttributeValue>, metadata: Map<string, any> }) => of([]).pipe(
      map(() => new ContextDatasource(attributeSerializer.deserializeAsObject(settings))),
      map(ds => [ new ContentBinding({ id: ds.name, type: 'context' }) ])
    )
  });
};

export const datasourceContextFactory = (resolver: DatasourceResolver) => {
  const baseObject = {
    dataset: new Dataset(),
  };
  return new ContextPlugin<string>({ id: "datasource", name: 'datasource', title: 'Datasource', baseObject, resolver, editorComponent: DatasourceContextEditorComponent });
};
