import { NgModule, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MaterialModule } from '@ng-druid/material';
import { BridgeBuilderPluginManager } from '@ng-druid/bridge';
import { ParamPluginManager } from '@ng-druid/dparam';
import { TokenModule } from '@ng-druid/token';
import { SnippetModule } from '@ng-druid/snippet';
import { CONTEXT_PLUGIN } from './context.tokens';
import { AttributeSerializerService } from '@ng-druid/attributes';
import { routeContextFactory, contextBridgeFactory, paramPluginFactory, contextDatasourceFactory, datasourceContextFactory } from './context.factories';
import { RouteResolver } from './resolvers/route.resolver';
import { ContextFormComponent } from './components/context-form/context-form.component';
import { ContextEditorHostDirective } from './directives/context-editor-host.directive';
import { ContextPluginManager } from './services/context-plugin-manager.service';
import { ContextPlugin } from './models/context.models';
import { TokenizerService } from '@ng-druid/token';
import { InlineContextResolverService } from './services/inline-context-resolver.service';
import { ContextDatasourceFormComponent } from './components/context-datasource-form/context-datasource-form.component';
import { ContextDatasourceComponent } from './components/context-datasource/context-datasource.component';
import { DatasourceModule, DatasourcePluginManager } from '@ng-druid/datasource';
import { DatasourceResolver } from './resolvers/datasource.resolver';
import { DatasourceContextEditorComponent } from './components/datasource-context-editor/datasource-context-editor.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MaterialModule, FlexLayoutModule, TokenModule, SnippetModule, DatasourceModule],
  providers: [
    { provide: RouteResolver, useClass: RouteResolver },
    { provide: DatasourceResolver, useClass: DatasourceResolver },
    { provide: CONTEXT_PLUGIN, useFactory: routeContextFactory, multi: true, deps: [ RouteResolver ] }
  ],
  declarations: [ContextFormComponent, ContextEditorHostDirective, ContextDatasourceFormComponent, ContextDatasourceComponent, DatasourceContextEditorComponent],
  exports: [ContextFormComponent, ContextDatasourceFormComponent, ContextDatasourceComponent, DatasourceContextEditorComponent]
})
export class ContextModule {
  constructor(
    @Inject(CONTEXT_PLUGIN) contextPlugins: Array<ContextPlugin<string>>,
    inlineContextResolver: InlineContextResolverService,
    tokenizerService: TokenizerService,
    cpm: ContextPluginManager,
    bpm: BridgeBuilderPluginManager,
    dpm: DatasourcePluginManager,
    ppm: ParamPluginManager,
    attributeSerializer: AttributeSerializerService,
    datasourceResolver: DatasourceResolver
  ) {
    contextPlugins.forEach(p => cpm.register(p));
    bpm.register(contextBridgeFactory(cpm, inlineContextResolver));
    ppm.register(paramPluginFactory(inlineContextResolver, tokenizerService));
    dpm.register(contextDatasourceFactory(inlineContextResolver, attributeSerializer));
    cpm.register(datasourceContextFactory(datasourceResolver));
  }
}
