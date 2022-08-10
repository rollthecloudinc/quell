import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '@rollthecloudinc/material';
import { InteractionEventComponent } from './components/interaction-event/interaction-event.component';
import { InteractionListenerComponent } from './components/interaction-listener/interaction-listener.component';
import { InteractionsDialogComponent } from './components/interactions-dialog/interactions-dialog.component';
import { InteractionsFormComponent } from './components/interactions-form/interactions-form.component';
import { InteractionEventPluginManager } from './services/interaction-event-plugin-manager.service';
import { interactionEventDomFactory } from './detour.factories';
import { InteractionEventRendererHostDirective } from './directives/interaction-event-renderer-host.directive';
import { InteractionHandlerRendererHostDirective } from './directives/interaction-handler-renderer-host.directive';
import { InteractionHandlerComponent } from './components/interaction-handler/interaction-handler.component';

@NgModule({
  declarations: [
    InteractionsDialogComponent,
    InteractionsFormComponent,
    InteractionListenerComponent,
    InteractionEventComponent,
    InteractionHandlerComponent,
    InteractionEventRendererHostDirective,
    InteractionHandlerRendererHostDirective
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule
  ],
  exports: [
    InteractionsDialogComponent,
    InteractionsFormComponent,
    InteractionListenerComponent,
    InteractionEventComponent,
    InteractionHandlerComponent
  ]
})
export class DetourModule { 
  constructor(
    iepm: InteractionEventPluginManager
  ) {
    iepm.register(interactionEventDomFactory());
  }
}
