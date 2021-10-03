import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AngularSplitModule } from 'angular-split';
import { MaterialModule } from 'material';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { MarkdownModule } from 'ngx-markdown';
import { UtilsModule } from 'utils';
import { SnippetFormComponent } from './components/snippet-form/snippet-form.component';

@NgModule({
  declarations: [  
    SnippetFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule, 
    FormsModule,
    FlexLayoutModule,
    AngularSplitModule,
    MaterialModule,
    NgxJsonViewerModule,
    MarkdownModule,
    UtilsModule
  ],
  exports: [
    SnippetFormComponent
  ]
})
export class SnippetModule { }
