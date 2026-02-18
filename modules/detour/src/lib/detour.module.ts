import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '@rollthecloudinc/material';
import { DparamModule, ParamEvaluatorService } from '@rollthecloudinc/dparam';
import { InteractionListenerComponent } from './components/interaction-listener/interaction-listener.component';
import { InteractionsDialogComponent } from './components/interactions-dialog/interactions-dialog.component';
import { InteractionsFormComponent } from './components/interactions-form/interactions-form.component';
import { InteractionEventPluginManager } from './services/interaction-event-plugin-manager.service';
import { interactionEventComponentFactory, interactionEventDomFactory, interactionEventImmediateFactory, interactionHandlerDriverFactory, interactionHandlerHelloWorldFactory, interactionHandlerNavigateFactory, interactionHandlerTimelineFactory } from './detour.factories';
import { InteractionHandlerPluginManager } from './services/interaction-handler-plugin-manager.service';
import { CursorOverlayComponent } from './components/cursor-overlay/cursor-overlay.component';
import { Router } from '@angular/router';
import { CursorOverlayService } from '../public-api';
import { RoleRegistry } from '@rollthecloudinc/utils';
import { TimelineEngineService } from './services/timeline-engine.service';

@NgModule({
  declarations: [
    InteractionsDialogComponent,
    InteractionsFormComponent,
    InteractionListenerComponent,
    CursorOverlayComponent
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
    InteractionListenerComponent,
    CursorOverlayComponent
  ]
})
export class DetourModule { 
  constructor(
    router: Router,
    iepm: InteractionEventPluginManager,
    ihpm: InteractionHandlerPluginManager,
    paramEvaluatorService: ParamEvaluatorService,
    roleRegistry: RoleRegistry,
    cursorOverlayService: CursorOverlayService,
    timeline: TimelineEngineService
  ) {
    iepm.register(interactionEventDomFactory(paramEvaluatorService));
    iepm.register(interactionEventComponentFactory(paramEvaluatorService, roleRegistry, timeline));
    iepm.register(interactionEventImmediateFactory(paramEvaluatorService));
    ihpm.register(interactionHandlerHelloWorldFactory());
    ihpm.register(interactionHandlerNavigateFactory({ router }))
    ihpm.register(interactionHandlerDriverFactory(cursorOverlayService));
    ihpm.register(interactionHandlerTimelineFactory(cursorOverlayService, timeline));
  }
}
