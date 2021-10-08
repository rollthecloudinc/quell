import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { MaterialModule } from 'material';
import { DatasourceModule, DatasourcePluginManager } from 'datasource';
import { AngularSplitModule } from 'angular-split';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { SnippetModule } from 'snippet';
import { TokenModule } from 'token';
import { RestSourceFormComponent } from './components/rest-source-form/rest-source-form.component';
import { restDatasourcePluginFactory } from './rest.factories';
import { Rest2FormComponent } from './components/rest2-form/rest2-form.component';

@NgModule({
  declarations: [ RestSourceFormComponent, Rest2FormComponent ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    AngularSplitModule,
    NgxJsonViewerModule,
    SnippetModule,
    DatasourceModule,
    TokenModule
  ],
  exports: [ RestSourceFormComponent, Rest2FormComponent ]
})
export class RestModule { 
  constructor(
    dspm: DatasourcePluginManager
  ) {
    dspm.register(restDatasourcePluginFactory());
  }
}
