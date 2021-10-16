import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { MaterialModule } from 'material';
import { DatasourceModule, DatasourcePluginManager } from 'datasource';
import { AngularSplitModule } from 'angular-split';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { SnippetModule } from 'snippet';
import { TokenModule } from 'token';
import { ParamContextExtractorService } from 'context';
import { AttributeSerializerService } from 'attributes';
import { RestSourceFormComponent } from './components/rest-source-form/rest-source-form.component';
import { restDatasourcePluginFactory } from './rest.factories';
import { RestDatasourceComponent } from './components/rest-datasource/rest-datasource.component';
import { RestFetchHelperService } from './services/rest-fetch-helper.service';

@NgModule({
  declarations: [ RestSourceFormComponent, RestDatasourceComponent ],
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
  exports: [ RestSourceFormComponent, RestDatasourceComponent ],
  providers: [
    RestFetchHelperService
  ]
})
export class RestModule { 
  constructor(
    dspm: DatasourcePluginManager,
    fetchHelper: RestFetchHelperService,
    paramContextExtractor: ParamContextExtractorService,
    attributeSerializer: AttributeSerializerService
  ) {
    dspm.register(restDatasourcePluginFactory(fetchHelper, paramContextExtractor, attributeSerializer));
  }
}
