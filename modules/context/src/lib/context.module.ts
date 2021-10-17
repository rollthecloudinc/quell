import { NgModule, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MaterialModule } from 'material';
import { BridgeBuilderPluginManager } from 'bridge';
import { ParamPluginManager } from 'dparam';
import { TokenModule } from 'token';
import { SnippetModule } from 'snippet';
import { CONTEXT_PLUGIN } from './context.tokens';
import { AttributeSerializerService } from 'attributes';
import { routeContextFactory, contextBridgeFactory, paramPluginFactory, contextDatasourceFactory } from './context.factories';
import { RouteResolver } from './resolvers/route.resolver';
import { ContextFormComponent } from './components/context-form/context-form.component';
import { ContextEditorHostDirective } from './directives/context-editor-host.directive';
import { ContextPluginManager } from './services/context-plugin-manager.service';
import { ContextPlugin } from './models/context.models';
import { TokenizerService } from 'token';
import { InlineContextResolverService } from './services/inline-context-resolver.service';
import { ContextDatasourceFormComponent } from './components/context-datasource-form/context-datasource-form.component';
import { ContextDatasourceComponent } from './components/context-datasource/context-datasource.component';
import { DatasourcePluginManager } from 'datasource';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MaterialModule, FlexLayoutModule, TokenModule, SnippetModule],
  providers: [
    { provide: RouteResolver, useClass: RouteResolver },
    { provide: CONTEXT_PLUGIN, useFactory: routeContextFactory, multi: true, deps: [ RouteResolver ] }
  ],
  declarations: [ContextFormComponent, ContextEditorHostDirective, ContextDatasourceFormComponent, ContextDatasourceComponent],
  exports: [ContextFormComponent, ContextDatasourceFormComponent, ContextDatasourceComponent]
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
    attributeSerializer: AttributeSerializerService
  ) {
    contextPlugins.forEach(p => cpm.register(p));
    bpm.register(contextBridgeFactory(cpm, inlineContextResolver));
    ppm.register(paramPluginFactory(inlineContextResolver, tokenizerService));
    dpm.register(contextDatasourceFactory(inlineContextResolver, attributeSerializer));
  }
}
