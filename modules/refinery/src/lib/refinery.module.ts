import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '@rollthecloudinc/material';
import { PersistenceDialogComponent } from './components/persistence-dialog/persistence-dialog.component';
import { PersistenceFormComponent } from './components/persistence-form/persistence-form.component';
import { DataductRenderHostDirective } from './directives/dataduct-render-host.directive';

@NgModule({
  declarations: [
    PersistenceDialogComponent,
    PersistenceFormComponent,
    DataductRenderHostDirective
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule
  ],
  exports: [
    PersistenceDialogComponent,
    PersistenceFormComponent
  ]
})
export class RefineryModule { }
