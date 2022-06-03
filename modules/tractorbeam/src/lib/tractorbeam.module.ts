import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EffectsModule } from '@ngrx/effects';
import { ContextModule, ContextPluginManager } from '@rollthecloudinc/context';
import { MaterialModule } from '@rollthecloudinc/material';
import { ContextModuleEditorComponent } from './components/context-module-editor/context-module-editor.component';
import { ContextModuleFormComponent } from './components/context-module-form/context-module-form.component';
import { PageBuilderBeamEffects } from './effects/page-builder-beam.effects';
import { ModuleResolver } from './resolvers/module.resolver';
import { moduleContextFactory } from  './tractorbeam.factories';
import { ExternalDiscovery } from './services/external-discovery.service';
import { ContentPluginManager } from '@rollthecloudinc/content';
@NgModule({
  declarations: [
    ContextModuleFormComponent,
    ContextModuleEditorComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ContextModule,
    MaterialModule,
    EffectsModule.forFeature([ PageBuilderBeamEffects ])
  ],
  exports: [
    ContextModuleFormComponent,
    ContextModuleEditorComponent
  ],
  providers: [
    ModuleResolver
  ]
})
export class TractorbeamModule { 
  constructor(
    cpm: ContextPluginManager,
    ccpm: ContentPluginManager,
    moduleResolver: ModuleResolver,
    externalDiscovey: ExternalDiscovery
  ) {
    ccpm.addDiscovery(externalDiscovey);
    cpm.register(moduleContextFactory({ moduleResolver }));
  }
}
