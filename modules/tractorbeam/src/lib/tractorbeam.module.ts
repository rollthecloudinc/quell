import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EffectsModule } from '@ngrx/effects';
import { ContextModule, ContextPluginManager } from 'context';
import { MaterialModule } from '@ng-druid/material';
import { ContextModuleEditorComponent } from './components/context-module-editor/context-module-editor.component';
import { ContextModuleFormComponent } from './components/context-module-form/context-module-form.component';
import { PageBuilderBeamEffects } from './effects/page-builder-beam.effects';
import { ModuleResolver } from './resolvers/module.resolver';
import { moduleContextFactory } from  './tractorbeam.factories';
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
    moduleResolver: ModuleResolver
  ) {
    cpm.register(moduleContextFactory({ moduleResolver }));
  }
}
