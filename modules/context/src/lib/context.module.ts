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
import { routeContextFactory, contextBridgeFactory, paramPluginFactory } from './context.factories';
import { RouteResolver } from './resolvers/route.resolver';
import { ContextFormComponent } from './components/context-form/context-form.component';
import { ContextEditorHostDirective } from './directives/context-editor-host.directive';
import { ContextPluginManager } from './services/context-plugin-manager.service';
import { ContextPlugin } from './models/context.models';
import { TokenizerService } from 'token';
import { InlineContextResolverService } from './services/inline-context-resolver.service';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MaterialModule, FlexLayoutModule, TokenModule, SnippetModule],
  providers: [
    { provide: RouteResolver, useClass: RouteResolver },
    { provide: CONTEXT_PLUGIN, useFactory: routeContextFactory, multi: true, deps: [ RouteResolver ] }
  ],
  declarations: [ContextFormComponent, ContextEditorHostDirective],
  exports: [ContextFormComponent]
})
export class ContextModule {
  constructor(
    @Inject(CONTEXT_PLUGIN) contextPlugins: Array<ContextPlugin<string>>,
    inlineContextResolver: InlineContextResolverService,
    tokenizerService: TokenizerService,
    cpm: ContextPluginManager,
    bpm: BridgeBuilderPluginManager,
    ppm: ParamPluginManager
  ) {
    contextPlugins.forEach(p => cpm.register(p));
    bpm.register(contextBridgeFactory(cpm));
    ppm.register(paramPluginFactory(inlineContextResolver, tokenizerService));
  }
}
