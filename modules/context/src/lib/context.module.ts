import { NgModule, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MaterialModule } from 'material';
import { BridgeBuilderPluginManager } from 'bridge';
import { CONTEXT_PLUGIN } from './context.tokens';
import { routeContextFactory, contextBridgeFactory } from './context.factories';
import { RouteResolver } from './resolvers/route.resolver';
import { ContextFormComponent } from './components/context-form/context-form.component';
import { ContextEditorHostDirective } from './directives/context-editor-host.directive';
import { ContextPluginManager } from './services/context-plugin-manager.service';
import { ContextPlugin } from './models/context.models';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MaterialModule, FlexLayoutModule],
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
    cpm: ContextPluginManager,
    bpm: BridgeBuilderPluginManager
  ) {
    contextPlugins.forEach(p => cpm.register(p));
    bpm.register(contextBridgeFactory(cpm));
  }
}
