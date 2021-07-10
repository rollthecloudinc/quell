import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { MaterialModule } from 'material';
import { AngularSplitModule } from 'angular-split';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { RestSourceFormComponent } from './components/rest-source-form/rest-source-form.component';

@NgModule({
  declarations: [ RestSourceFormComponent ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    AngularSplitModule,
    NgxJsonViewerModule
  ],
  exports: [ RestSourceFormComponent ]
})
export class RestModule { }
