import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '@rollthecloudinc/material';
import { InteractionActionComponent } from './components/interaction-action/interaction-action.component';
import { InteractionListenerComponent } from './components/interaction-listener/interaction-listener.component';
import { InteractionsDialogComponent } from './components/interactions-dialog/interactions-dialog.component';
import { InteractionsFormComponent } from './components/interactions-form/interactions-form.component';

@NgModule({
  declarations: [
    InteractionsDialogComponent,
    InteractionsFormComponent,
    InteractionListenerComponent,
    InteractionActionComponent
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
    InteractionActionComponent
  ]
})
export class DetourModule { }
