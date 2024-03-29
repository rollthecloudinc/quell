import { SnippetContentHandler } from './handlers/snippet-content.handler';
import { AttributeContentHandler } from './handlers/attribute-content.handler';
import { MediaContentHandler } from './handlers/media-content.handler';
// import { PanelContentHandler } from './handlers/panel-content.handler';
import { ContentBinding, ContentPlugin } from '@rollthecloudinc/content';
import { ContextPlugin, InlineContext, InlineContextResolverService, ResolvedContextPlugin } from '@rollthecloudinc/context';
import { Dataset, DatasourceFormComponent, DatasourcePlugin } from '@rollthecloudinc/datasource';
import { PanelPageState, PanelState , PaneState, StylePlugin, FormService, FormDatasource, PanelPageForm, PageBuilderFacade, PanelPage } from '@rollthecloudinc/panels';
import { AttributeSerializerService, AttributeValue } from '@rollthecloudinc/attributes';
import { SnippetPaneRendererComponent } from './plugins/snippet/snippet-pane-renderer/snippet-pane-renderer.component';
import { SnippetEditorComponent } from './plugins/snippet/snippet-editor/snippet-editor.component';
import { AttributeSelectorComponent } from './plugins/attribute/attribute-selector/attribute-selector.component';
import { AttributeEditorComponent } from './plugins/attribute/attribute-editor/attribute-editor.component';
import { AttributePaneRendererComponent } from './plugins/attribute/attribute-pane-renderer/attribute-pane-renderer.component';
import { MediaEditorComponent } from './plugins/media/media-editor/media-editor.component';
import { MediaPaneRendererComponent } from './plugins/media/media-pane-renderer/media-pane-renderer.component';
// import { PanelSelectorComponent } from './plugins/panel/panel-selector/panel-selector.component';
// import { PanelEditorComponent } from './plugins/panel/panel-editor/panel-editor.component';
import { RestEditorComponent } from './plugins/rest/rest-editor/rest-editor.component';
import { RestContentHandler } from './handlers/rest-content-handler.service';
import { RestPaneRendererComponent } from './plugins/rest/rest-pane-renderer/rest-pane-renderer.component';
import { SliceContentHandler } from './handlers/slice-content.handler';
import { SliceEditorComponent } from './plugins/slice/slice-editor/slice-editor.component';
import { PageContextResolver } from './contexts/page-context.resolver';
import { ContextEditorComponent } from './components/context-editor/context-editor.component';
import { RestContextResolver } from './contexts/rest-context.resolver';
import { FormContextResolver } from './contexts/form-context.resolver';
import { TabsPanelEditorComponent } from './plugins/style/tabs-panel-editor/tabs-panel-editor.component';
import { TabsPanelRendererComponent } from './plugins/style/tabs-panel-renderer/tabs-panel-renderer.component';
import { TabsStyleHandler } from './handlers/style/tabs-style.handler';
import { PaneStateContextResolver } from './contexts/pane-state-context.resolver';
import { PageStateContextResolver } from './contexts/page-state-context.resolver';
import { PageStateEditorComponent } from './components/page-state-editor/page-state-editor.component';
import { ParamPlugin, Param, ParamEvaluatorService } from '@rollthecloudinc/dparam';
import { defaultIfEmpty, map, switchMap, take, tap } from 'rxjs/operators';
import { TokenizerService } from '@rollthecloudinc/token';
import { combineLatest, merge, of } from 'rxjs';
import { BridgeBuilderPlugin, PublicApiBridgeService } from '@rollthecloudinc/bridge';
import { CrudAdaptorPlugin, CrudOperationInput, CrudOperationResponse } from '@rollthecloudinc/crud';
import { FormDatasourceComponent } from './components/form-datasource/form-datasource.component';
import { JSONPath } from 'jsonpath-plus';
import { UrlMatcher, UrlSegment } from '@angular/router';

export const snippetContentPluginFactory = (handler: SnippetContentHandler) => {
  return new ContentPlugin<string>({
    id: 'snippet',
    title: 'Snippet',
    selectionComponent: undefined,
    editorComponent: SnippetEditorComponent,
    renderComponent: SnippetPaneRendererComponent,
    handler
  })
}

export const attributeContentPluginFactory = (handler: AttributeContentHandler) => {
  return new ContentPlugin<string>({
    id: 'attribute',
    title: 'Attribute',
    selectionComponent: AttributeSelectorComponent,
    editorComponent: AttributeEditorComponent,
    renderComponent: AttributePaneRendererComponent,
    handler
  })
}

export const mediaContentPluginFactory = (handler: MediaContentHandler) => {
  return new ContentPlugin<string>({
    id: 'media',
    title: 'Media',
    selectionComponent: undefined,
    editorComponent: MediaEditorComponent,
    renderComponent: MediaPaneRendererComponent,
    handler
  })
}

/*export const panelContentPluginFactory = (handler: PanelContentHandler) => {
  return new ContentPlugin<string>({
    id: 'panel',
    title: 'Panel',
    selectionComponent: PanelSelectorComponent,
    editorComponent: PanelEditorComponent,
    renderComponent: undefined,
    handler
  })
}*/

export const restContentPluginFactory = (handler: RestContentHandler) => {
  return new ContentPlugin<string>({
    id: 'rest',
    title: 'REST',
    selectionComponent: undefined,
    editorComponent: RestEditorComponent,
    renderComponent: RestPaneRendererComponent,
    handler
  })
}

export const sliceContentPluginFactory = (handler: SliceContentHandler) => {
  return new ContentPlugin<string>({
    id: 'slice',
    title: 'Slice',
    selectionComponent: undefined,
    editorComponent: SliceEditorComponent,
    renderComponent: undefined,
    handler
  })
}

export const pageContextFactory = (resolver: PageContextResolver) => {
  const baseObject = {
    path: '',
  };
  return new ContextPlugin<string>({ id: "page", name: 'page', title: 'Page', global: true, group: 'pages', baseObject, resolver });
};

export const restContextFactory = (resolver: RestContextResolver) => {
  const baseObject = {
    dataset: new Dataset(),
  };
  return new ContextPlugin<string>({ id: "rest", name: 'rest', title: 'Rest', baseObject, resolver, editorComponent: ContextEditorComponent });
};

export const formContextFactory = (resolver: FormContextResolver) => {
  const baseObject = {
    dataset: new Dataset(),
  };
  return new ContextPlugin<string>({ id: "form", name: 'form', title: 'Form', baseObject, resolver });
};

export const paneStateContextFactory = (resolver: PaneStateContextResolver) => {
  const baseObject = new PaneState({ state: new AttributeValue() });
  return new ContextPlugin<string>({ id: 'panestate', name: 'panestate', title: 'Pane State', internal: true, baseObject, resolver });
};

export const pageStateContextFactory = (resolver: PageStateContextResolver) => {
  const baseObject = new PaneState({ state: new AttributeValue() });
  return new ContextPlugin<string>({ id: 'pagestate', name: 'pagestate', title: 'Page State', internal: true, baseObject, resolver, editorComponent: PageStateEditorComponent });
};

export const tabsStylePluginFactory = (handler: TabsStyleHandler) => {
  return new StylePlugin<string>({ id: 'tabs', name: 'tabs', title: 'Tabs', handler, editorComponent: TabsPanelEditorComponent, renderComponent: TabsPanelRendererComponent }); 
};

export const formParamPluginFactory = (
  tokenizerService: TokenizerService,
  formService: FormService,
  pageBuilderFacade: PageBuilderFacade
) => {
  return new ParamPlugin<string>({ 
    id: 'form',
    title: 'Form',
    usedContexts: ({ param, metadata }: { param: Param, metadata: Map<string, any> }) => of([ `form__${param.mapping.value.substr(0, param.mapping.value.indexOf('.'))}` ]),
    evalParam: ({ param, metadata }: { param: Param, metadata: Map<string, any> })  => {
      const name = param.mapping.value.substr(0, param.mapping.value.indexOf('.'));
      const value = param.mapping.value.substr(param.mapping.value.indexOf('.') + 1);
      console.log(`form: ${name} || ${value}`);
      return pageBuilderFacade.getForm$(name).pipe(
        take(1),
        map(form => form ? form : new PanelPageForm() ),
        map(form => formService.serializeForm(form)),
        map(obj => tokenizerService.generateGenericTokens(obj)),
        tap(tokens => console.log(tokens)),
        map(tokens => {
          if(!tokens.has(`.${value}`)) {
            return '';
          } else {
            return tokenizerService.replaceTokens(`[.${value}]`/*`[.${value}.value]`*/, tokens);
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
    }
  });
}

export const formResolvedContextPluginFactory = (
  pageBuilderFacade: PageBuilderFacade
) => {
  return new ResolvedContextPlugin<string>({
    id: 'form',
    title: 'Form',
    resolve: () => pageBuilderFacade.getFormNames$.pipe(
      switchMap(names => names.length === 0 ? of([]) : combineLatest( names.map(n => pageBuilderFacade.getForm$(n).pipe(
        map(f => [n, f])
      ) ) )),
      map(v => v.reduce((p, [n, f]) => ({ ...p, [`form__${n}`]: f }), {}))
    ),
    resolveSingle: () => pageBuilderFacade.getFormNames$.pipe(
      switchMap(names => merge( ...names.map(n => pageBuilderFacade.getForm$(n).pipe(
        map(f => [`form__${n}`, f])
      ) ) ))
    )
  });
};

export const pagesFormBridgeFactory = (formService: FormService) => {
  return new BridgeBuilderPlugin<string>({
    id: 'pages_form',
    title: 'Pages Form',
    build: () => {
      PublicApiBridgeService.prototype['serializePageForm'] = (form: PanelPageForm): Promise<any> => {
        return new Promise(res => {
          res(formService.serializeForm(form));
        });
      }
    }
  }); 
};

export const formSerializationEntityCrudAdaptorPluginFactory = (paramsEvaluatorService: ParamEvaluatorService, formService: FormService) => {
  return new CrudAdaptorPlugin<string>({
    id: 'panelpageform_serialize',
    title: 'Panelpageform Serialize',
    create: ({ object }: CrudOperationInput) => of<CrudOperationResponse>({ success: false, entity: formService.serializeForm(new PanelPageForm(object)) }),
    read: ({ }: CrudOperationInput) => of<CrudOperationResponse>({ success: false }),
    update: ({ }: CrudOperationInput) => of<CrudOperationResponse>({ success: false }),
    delete: ({ }: CrudOperationInput) => of<CrudOperationResponse>({ success: false })
  });
};

export const formDatasourcePluginFactory = (attributeSerializer: AttributeSerializerService, pageBuilderFacade: PageBuilderFacade, formService: FormService) => {
  return new DatasourcePlugin<string>({ 
    id: 'form', 
    title: 'Form', 
    editor: FormDatasourceComponent,
    fetch: ({ settings }: { settings: Array<AttributeValue>, dataset?: Dataset }) => of(new Dataset()).pipe(
      map(() => new FormDatasource(attributeSerializer.deserializeAsObject(settings))),
      switchMap(ds =>  pageBuilderFacade.getForm$(ds.name).pipe(
        map(form => [ds, form ? form : new PanelPageForm()]),
        defaultIfEmpty([ds, new PanelPageForm()]),
        take(1)
      )),
      map(([ds, form]) => [ds, formService.serializeForm(form as PanelPageForm)]),
      map(([ds, json]) => new Dataset({ results: JSONPath({ path: `$.${ds.field}.*`, json }) }))
    ),
    getBindings: ({ settings, metadata }: { settings: Array<AttributeValue>, metadata?: Map<string, any> }) => of([]).pipe(
      map(() => new FormDatasource(attributeSerializer.deserializeAsObject(settings))),
      map(ds => [ new ContentBinding({ id: `form__${ds.name}`, type: 'context' }) ])
    )
  })
};

export const createMatcher = (panelPage: PanelPage): UrlMatcher => {
  return (url: UrlSegment[]) => {
    if(('/' + url.map(u => u.path).join('/')).indexOf(panelPage.path) === 0) {
      const pathLen = panelPage.path.substr(1).split('/').length;
      return {
        consumed: url,
        posParams: url.reduce<{}>((p, c, index) => {
          if(index === 0) {
            return { ...p, panelPageId: new UrlSegment(panelPage.id , {}) }
          } else if(index > pathLen - 1) {
            return { ...p, [`arg${index - pathLen}`]: new UrlSegment(c.path, {}) };
          } else {
            return { ...p };
          }
        }, {})
      };
    } else {
      return null;
    }
  };
};

export const createEditMatcher = (panelPage: PanelPage): UrlMatcher => {
  return (url: UrlSegment[]) => {
    if(('/' + url.map(u => u.path).join('/')).indexOf(panelPage.path) === 0 && url.map(u => u.path).join('/').indexOf('/manage') > -1) {
      const pathLen = panelPage.path.substr(1).split('/').length;
      return {
        consumed: url,
        posParams: url.reduce<{}>((p, c, index) => {
          if(index === 0) {
            return { ...p, panelPageId: new UrlSegment(panelPage.id , {}) }
          } else {
            return { ...p };
          }
        }, {})
      };
    } else {
      return null;
    }
  };
};
