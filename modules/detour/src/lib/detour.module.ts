import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '@rollthecloudinc/material';
import { DparamModule } from '@rollthecloudinc/dparam';
import { InteractionListenerComponent } from './components/interaction-listener/interaction-listener.component';
import { InteractionsDialogComponent } from './components/interactions-dialog/interactions-dialog.component';
import { InteractionsFormComponent } from './components/interactions-form/interactions-form.component';
import { InteractionEventPluginManager } from './services/interaction-event-plugin-manager.service';
import { interactionEventDomFactory } from './detour.factories';

@NgModule({
  declarations: [
    InteractionsDialogComponent,
    InteractionsFormComponent,
    InteractionListenerComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    DparamModule
  ],
  exports: [
    InteractionsDialogComponent,
    InteractionsFormComponent,
    InteractionListenerComponent
  ]
})
export class DetourModule { 
  constructor(
    iepm: InteractionEventPluginManager
  ) {
    iepm.register(interactionEventDomFactory());
  }
}
