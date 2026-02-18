import { SnippetContentHandler } from './handlers/snippet-content.handler';
import { AttributeContentHandler } from './handlers/attribute-content.handler';
import { MediaContentHandler } from './handlers/media-content.handler';
// import { PanelContentHandler } from './handlers/panel-content.handler';
import { ContentBinding, ContentPlugin, ContentPluginManager } from '@rollthecloudinc/content';
import { ContextPlugin, InlineContext, InlineContextResolverService, ResolvedContextPlugin } from '@rollthecloudinc/context';
import { Dataset, DatasourceFormComponent, DatasourcePlugin } from '@rollthecloudinc/datasource';
import { PanelPageState, PanelState , PaneState, StylePlugin, FormService, FormDatasource, PanelPageForm, PageBuilderFacade, PanelPage, autoFillSteps } from '@rollthecloudinc/panels';
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
import { combineLatest, firstValueFrom, merge, of } from 'rxjs';
import { BridgeBuilderPlugin, PublicApiBridgeService } from '@rollthecloudinc/bridge';
import { CrudAdaptorPlugin, CrudOperationInput, CrudOperationResponse } from '@rollthecloudinc/crud';
import { FormDatasourceComponent } from './components/form-datasource/form-datasource.component';
import * as jpp from 'jsonpath-plus';
import { UrlMatcher, UrlSegment } from '@angular/router';
import { ButtonContentHandler } from './handlers/button-content.handler';
import { ButtonEditorComponent } from './plugins/button/button-editor/button-editor.component';
import { ButtonRendererComponent } from './plugins/button/button-renderer/button-renderer.component';
import { IconContentHandler } from './handlers/icon-content.handler';
import { IconEditorComponent } from './plugins/icon/icon-editor/icon-editor.component';
import { IconRendererComponent } from './plugins/icon/icon-renderer/icon-renderer.component';
import { LinkContentHandler } from './handlers/link-content.handler';
import { LinkEditorComponent } from './plugins/link/link-editor/link-editor.component';
import { LinkRendererComponent } from './plugins/link/link-renderer/link-renderer.component';
import { MenuContentHandler } from './handlers/menu-content.handler';
import { MenuEditorComponent } from './plugins/menu/menu-editor/menu-editor.component';
import { MenuRendererComponent } from './plugins/menu/menu-renderer/menu-renderer.component';
import { SidenavPanelRendererComponent } from './plugins/style/sidenav-panel-renderer/sidenav-panel-renderer.component';
import { SidenavPanelEditorComponent } from './plugins/style/sidenav-panel-editor/sidenav-panel-editor.component';
import { IconButtonContentHandler } from './handlers/icon-button-content.handler';
import { IconButtonEditorComponent } from './plugins/icon-button/icon-button-editor/icon-button-editor.component';
import { IconButtonRendererComponent } from './plugins/icon-button/icon-button-renderer/icon-button-renderer.component';
import { FabContentHandler } from './handlers/fab-content.handler';
import { FabEditorComponent } from './plugins/fab/fab-editor/fab-editor.component';
import { FabRendererComponent } from './plugins/fab/fab-renderer/fab-renderer.component';
import { ContentEditorHandler } from './handlers/content-editor.handler';
import { ContentEditorRendererComponent } from './plugins/content-editor/content-editor-renderer/content-editor-renderer.component';
import { CursorOverlayService, InteractionHandlerPlugin, resolveTargetElement, TimelineEngineService, TimelineStep, waitForComponent, squashSteps, stitchSteps, sliceSteps, spliceSteps } from '@rollthecloudinc/detour';
import { TimelineNavContentHandler } from './handlers/timeline-nav-content.handler';
import { TimelineNavRendererComponent } from './plugins/timeline-nav/timeline-nav-renderer/timeline-nav-renderer.component';
import { TimelineNavEditorComponent } from './plugins/timeline-nav/timeline-nav-editor/timeline-nav-editor.component';
import { RoleRegistry } from '@rollthecloudinc/utils';

export const snippetContentPluginFactory = (handler: SnippetContentHandler) => {
  return new ContentPlugin<string>({
    id: 'snippet',
    title: 'Snippet',
    cls: 'snippet',
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

export const buttonContentPluginFactory = (handler: ButtonContentHandler) => {
  return new ContentPlugin<string>({
    id: 'button',
    title: 'Button',
    cls: 'standard-button',
    selectionComponent: undefined,
    editorComponent: ButtonEditorComponent,
    renderComponent: ButtonRendererComponent,
    handler
  })
}

export const iconContentPluginFactory = (handler: IconContentHandler) => {
  return new ContentPlugin<string>({
    id: 'icon',
    title: 'Icon',
    selectionComponent: undefined,
    editorComponent: IconEditorComponent,
    renderComponent: IconRendererComponent,
    handler
  })
}

export const linkContentPluginFactory = (handler: LinkContentHandler) => {
  return new ContentPlugin<string>({
    id: 'link',
    title: 'Link',
    selectionComponent: undefined,
    editorComponent: LinkEditorComponent,
    renderComponent: LinkRendererComponent,
    handler
  })
}

export const menuContentPluginFactory = (handler: MenuContentHandler) => {
  return new ContentPlugin<string>({
    id: 'menu',
    title: 'Menu',
    selectionComponent: undefined,
    editorComponent: MenuEditorComponent,
    renderComponent: MenuRendererComponent,
    handler
  })
}

export const iconButtonContentPluginFactory = (handler: IconButtonContentHandler) => {
  return new ContentPlugin<string>({
    id: 'icon_button',
    title: 'Icon Button',
    selectionComponent: undefined,
    editorComponent: IconButtonEditorComponent,
    renderComponent: IconButtonRendererComponent,
    handler
  })
}

export const fabContentPluginFactory = (handler: FabContentHandler) => {
  return new ContentPlugin<string>({
    id: 'fab',
    title: 'Fab (Floating Action Button)',
    selectionComponent: undefined,
    editorComponent: FabEditorComponent,
    renderComponent: FabRendererComponent,
    handler
  })
}

export const contentEditorPluginFactory = (handler: ContentEditorHandler) => {
  return new ContentPlugin<string>({
    id: 'content_editor',
    title: 'Content Editor',
    selectionComponent: undefined,
    editorComponent: undefined,
    renderComponent: ContentEditorRendererComponent,
    handler
  })
}

export const timelineNavPluginFactory = (handler: TimelineNavContentHandler) => {
  return new ContentPlugin<string>({
    id: 'timeline_nav',
    title: 'Timeline Nav',
    selectionComponent: undefined,
    editorComponent: TimelineNavEditorComponent,
    renderComponent: TimelineNavRendererComponent,
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

export const sidenavStylePluginFactory = () => {
  return new StylePlugin<string>({ id: 'sidenav', name: 'sidenav', title: 'Sidenav', editorComponent: SidenavPanelEditorComponent, renderComponent: SidenavPanelRendererComponent }); 
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
      map(([ds, json]) => new Dataset({ results: jpp.JSONPath({ path: `$.${ds.field}.*`, json }) }))
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
      console.log('matcher matched for', panelPage.id, panelPage.path);
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

export const tourContentTypeFactory = ({
  group,
  plugin,
  registry,
  cursor,
  paneIndex = 0
}:{
  group: string,
  plugin: ContentPlugin,
  registry: RoleRegistry,
  cursor: CursorOverlayService
  paneIndex?: number
}): TimelineStep[] => {

  let step = 0
  const steps = [
    {
      group,
      weight: step++,
      autoContinue: false,
      title: 'Open main menu',
      run: async ctx => {
        console.log("Open main menu");
        const c = await waitForComponent('layout_editor', undefined, 0, registry)
        const t = resolveTargetElement(c, '.main-controls .drawer-trigger');
        cursor.moveTo(t)
        await setTimeout(() => c.open(), 1000)
      }
    },
    {
      group,
      weight: step++,
      autoContinue: false,
      title: 'Click add row',
      run: async ctx => {
        console.log("Click add row");
        const c = await waitForComponent('layout', undefined, 0, registry)
        const t = resolveTargetElement(c, '.add-row');
        cursor.moveTo(t)
        await setTimeout(() => c.addRow(), 1000)
      }
    },
    {
      group,
      weight: step++,
      autoContinue: false,
      title: 'Close main menu', 
      run: async ctx => {
        console.log("Close main menu");
        const c = await waitForComponent('layout_editor', undefined, 0, registry)
        const t = resolveTargetElement(c, '.close-wrapper .mat-icon');
        cursor.moveTo(t)
        await setTimeout(() => c.close(), 1000)
      }
    },
    {
      group,
      weight: step++,
      autoContinue: false,
      title: 'Open panel menu',
      run: async ctx => {
        console.log("Open panel menu");
        const c = await waitForComponent('layout_editor', undefined, 0, registry)
        const t = resolveTargetElement(c, '.panel-actions-btn');
        cursor.moveTo(t)
        await setTimeout(() => c.openMenu(), 1000)
      }
    },
    {
      group,
      weight: step++,
      autoContinue: false,
      title: 'Click add content',
      run: async ctx => {
        console.log("Click add content");
        const c = await waitForComponent('content_editor', undefined, 0, registry)
        const t = resolveTargetElement(c, '.add-content');
        cursor.moveTo(t)
        await setTimeout(() => c.addContent(0), 1000)
      }
    },
    {
      group,
      weight: step++,
      autoContinue: false,
      cursorBehavior: "scroll-to",
      title: 'Scroll to ' + plugin.title,
      run: async ctx => {
        console.log("Scroll to content type", plugin?.cls);
        const c = await waitForComponent('content_selector', undefined, 0, registry)
        const t = resolveTargetElement(c, '.mat-bottom-sheet-container-large .mat-mdc-nav-list');
        cursor.moveTo(t)
        await setTimeout(() => c.scrollTo(plugin.cls), 1000)
      }
    },
    {
      group,
      weight: step++,
      autoContinue: false,
      cursorBehavior: "click-item",
      title: 'Click ' + plugin.title,
      run: async ctx => {
        console.log("Click content type", plugin?.cls);
        const c = await waitForComponent('content_selector', undefined, 0, registry)
        const t = resolveTargetElement(c, '.' + plugin.cls);
        cursor.moveTo(t)
        await setTimeout(() => c.onEntitySelected(plugin), 1000)
      }
    }
  ]
  if (plugin.id.indexOf('form_') === 0 /*|| plugin.id === 'datasource'*/) {
    // For form elements set the name and title otherwise the label doesn't display and looks weird.
    steps.push({
      group,
      weight: step++,
      autoContinue: false,
      title: 'Open pane menu',
      run: async ctx => {
        console.log("Open pane menu");
        const c = await waitForComponent('editable_pane', undefined, paneIndex, registry)
        const t = resolveTargetElement(c, '.pane-menu-trigger-wrapper button');
        cursor.moveTo(t)
        await setTimeout(() => c.openMenu(), 1000)
      }
    })
    steps.push({
      group,
      weight: step++,
      autoContinue: false,
      title: 'Click props',
      run: async ctx => {
        console.log("Click props");
        const c = await waitForComponent('editable_pane', undefined, paneIndex, registry)
        const t = resolveTargetElement(c, '.props-btn');
        cursor.moveTo(t)
        await setTimeout(() => c.onPropsClick(), 1000)
      }
    })
  }
  if(plugin.renderComponent) {
    steps.push({
      group,
      weight: step++,
      autoContinue: false,
      title: 'Click preview',
      run: async ctx => {
        console.log("Click Preview");
        const c = await waitForComponent('content_editor', undefined, 0, registry)
        const t = resolveTargetElement(c, '.preview button');
        cursor.moveTo(t)
        await setTimeout(() => c.preview(), 1000)
      }
    }),
    steps.push({
      group,
      weight: step++,
      autoContinue: false,
      title: 'Close preview',
      run: async ctx => {
        console.log("Close Preview");
        const c = await waitForComponent('content_editor_renderer', undefined, 0, registry)
        const t = resolveTargetElement(c, '.close-preview');
        cursor.moveTo(t)
        await setTimeout(() => c.onPreviewClose(), 1000)
      }
    })
  }
  return steps
}

export const tourDataDependencyContentTypeFactory = ({
  group,
  plugin,
  dataPlugin,
  registry,
  cursor
}: {
  group: string,
  plugin: ContentPlugin,
  dataPlugin: ContentPlugin,
  registry: RoleRegistry,
  cursor: CursorOverlayService
}): TimelineStep[] => {
  const fillSteps = autoFillSteps({ group, registry, cursor, mouseTarget: 'button[type=submit]' })
  const dataSteps = stitchSteps(tourContentTypeFactory({ group, plugin: dataPlugin, registry, cursor }), fillSteps)
  const popSteps = stitchSteps(dataSteps, [
  {
      group,
      weight: 0,
      autoContinue: false,
      title: 'Open pane menu',
      run: async ctx => {
        console.log("Open pane menu");
        const c = await waitForComponent('editable_pane', undefined, 0, registry)
        const t = resolveTargetElement(c, '.pane-menu-trigger-wrapper button');
        cursor.moveTo(t)
        await setTimeout(() => c.openMenu(), 1000)
      }
    },{
      group,
      weight: 1,
      autoContinue: false,
      title: 'Click props',
      run: async ctx => {
        console.log("Click props");
        const c = await waitForComponent('editable_pane', undefined, 0, registry)
        const t = resolveTargetElement(c, '.props-btn');
        cursor.moveTo(t)
        await setTimeout(() => c.onPropsClick(), 1000)
      }
    }
  ])
  const propSteps = stitchSteps(popSteps, autoFillSteps({ group, registry, cursor, mouseTarget: 'button[type=submit]' }))
  const step = squashSteps(propSteps, group, 0, 2000)
  step.title = "Create Data"
  const tourSteps = sliceSteps(tourContentTypeFactory({ group, plugin, registry, cursor, paneIndex: 1 }), 3)
  const propsClickIndex = tourSteps.findIndex(s => s.title === 'Click props')
  const modifiedTourSteps = spliceSteps(tourSteps, propsClickIndex, 1, {
      ...tourSteps[propsClickIndex],
      run: async ctx => {
        await tourSteps[propsClickIndex].run(ctx)
        const c = await waitForComponent('editor', undefined, 0, registry)
        c.setFillContent({ name: plugin.id, label: plugin.title })
      }
  })
  const clickPluginIndex = modifiedTourSteps.findIndex(s => s.title === 'Click ' + plugin.title)
  const finalTourSteps = spliceSteps(modifiedTourSteps, clickPluginIndex, 1, {
    ...modifiedTourSteps[clickPluginIndex],
    run: async ctx => {
      await modifiedTourSteps[clickPluginIndex].run(ctx)
      const c = await waitForComponent('editor', undefined, 0, registry)
      c.setFillContent({ datasourceBinding: { id: 'test', type: 'pane' }, query: '', trackBy: undefined, idMapping: '[.id]', valueMapping: '[.id]', labelMapping: '[.name]' })
    }
  })
  const steps = stitchSteps([step], finalTourSteps)
  return steps
}

export function interactionHandlerTourContentTypeFactory(
  contentPluginManager: ContentPluginManager,
  timeline: TimelineEngineService,
  registry: RoleRegistry,
  cursor: CursorOverlayService
) {
  return new InteractionHandlerPlugin({
    id: 'tour_content_type',
    title: 'Tour Content Type',

    handle: async ({ handlerParams }) => {
      const group = (handlerParams as any)?.group;
      if (!group) {
        console.error('[tour_content_type] Missing required param "group"');
        return;
      }

      // Look up content plugin by name
      const plugin = await firstValueFrom(contentPluginManager.getPlugin(group));
      if (!plugin) {
        console.error(
          `[tour_content_type] No content plugin found for group "${group}"`
        );
        return;
      }

      const pluginCls = plugin?.cls;
      if (!pluginCls) {
        console.error(
          `[tour_content_type] Plugin "${group}" does not expose a cls property`
        );
        return;
      }

      // Build steps from the factory
      const steps = tourContentTypeFactory({ group, plugin, registry, cursor });

      // Register steps
      for (const step of steps) {
        timeline.registerStep(step);
      }

      console.log(
        `[tour_content_type] Registered ${steps.length} steps for group "${group}" using selector "${pluginCls}"`
      );
    }
  });
}

export const interactionHandlerTourDataDependencyContentTypeFactory = ({
  contentPluginManager,
  timeline,
  registry,
  cursor
}: {
  contentPluginManager: ContentPluginManager,
  timeline: TimelineEngineService,
  registry: RoleRegistry,
  cursor: CursorOverlayService
}) => {
  return new InteractionHandlerPlugin({
    id: 'tour_data_dependency_content_type',
    title: 'Tour Data Dependency Content Type',

    handle: async ({ handlerParams }) => {
      const group = (handlerParams as any)?.group;
      if (!group) {
        console.error('[tour_data_dependency_content_type] Missing required param "group"');
        return;
      }

      // Look up content plugin by name
      const plugin = await firstValueFrom(contentPluginManager.getPlugin(group));
      if (!plugin) {
        console.error(
          `[tour_data_dependency_content_type] No content plugin found for group "${group}"`
        );
        return;
      }

      const dataPlugin = await firstValueFrom(contentPluginManager.getPlugin('datasource'));

      const pluginCls = plugin?.cls;
      if (!pluginCls) {
        console.error(
          `[tour_data_dependency_content_type] Plugin "${group}" does not expose a cls property`
        );
        return;
      }

      // Build steps from the factory
      const steps = tourDataDependencyContentTypeFactory({ group, plugin, dataPlugin, registry, cursor });

      // Register steps
      for (const step of steps) {
        timeline.registerStep(step);
      }

      console.log(
        `[tour_data_dependency_content_type] Registered ${steps.length} steps for group "${group}" using selector "${pluginCls}"`
      );
    }
  });
}