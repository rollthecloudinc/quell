import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ContextPluginManager } from 'context';
import { ContextStateEditorComponent } from './components/context-state-editor/context-state-editor.component';
import { ContextStateFormComponent } from './components/context-state-form/context-state-form.component';
import { StateContextResolver } from './contexts/state-context.resolver';
import { stateContextFactory } from './state.factories';

@NgModule({
  declarations: [
    ContextStateEditorComponent,
    ContextStateFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [],
  providers: [
    StateContextResolver
  ]
})
export class StateModule { 
  constructor(
    cpm: ContextPluginManager,
    stateContextResolver: StateContextResolver
  ) {
    cpm.register(stateContextFactory(stateContextResolver));
  }
}

