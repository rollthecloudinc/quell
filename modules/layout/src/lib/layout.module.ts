import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularSplitModule } from 'angular-split';
import { MaterialModule } from '@rollthecloudinc/material';
import { GridsterModule } from 'angular-gridster2';
import { AttributesModule } from '@rollthecloudinc/attributes';
import { TokenModule } from '@rollthecloudinc/token';
import { UtilsModule } from '@rollthecloudinc/utils';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { FlexLayoutComponent } from './components/flex-layout/flex-layout.component';
import { GridLayoutComponent } from './components/grid-layout/grid-layout.component';
import { GridlessLayoutComponent } from './components/gridless-layout/gridless-layout.component';
import { SplitLayoutComponent } from './components/split-layout/split-layout.component';
import { LayoutFormComponent } from './components/layout-form/layout-form.component';
import { LayoutDialogComponent } from './components/layout-dialog/layout-dialog.component';
import { LayoutPluginManager } from './services/layout-plugin-manager.service';
import { splitLayoutFactory, gridlessLayoutFactory } from './layout.factories';
import { GridlessLayoutEditorComponent } from './components/gridless-layout-editor/gridless-layout-editor.component';
import { GridlessLayoutRendererComponent } from './components/gridless-layout-renderer/gridless-layout-renderer.component';
import { SplitLayoutEditorComponent } from './components/split-layout-editor/split-layout-editor.component';
import { FlexLayoutRendererComponent } from './components/flex-layout-renderer/flex-layout-renderer.component';
import { GridLayoutEditorComponent } from './components/grid-layout-editor/grid-layout.editor.component';
import { FlexLayoutServerModule } from '@angular/flex-layout/server';
// import { FlexLayoutServerModule } from '@angular/flex-layout/server';

@NgModule({
  declarations: [
    FlexLayoutComponent,
    GridLayoutComponent,
    GridlessLayoutComponent,
    SplitLayoutComponent,
    LayoutFormComponent,
    LayoutDialogComponent,
    GridlessLayoutEditorComponent,
    GridlessLayoutRendererComponent,
    SplitLayoutEditorComponent,
    FlexLayoutRendererComponent,
    GridLayoutEditorComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    FlexLayoutModule,
    // FlexLayoutServerModule,
    AngularSplitModule,
    GridsterModule,
    NgxDropzoneModule,
    UtilsModule,
    TokenModule,
    AttributesModule,
  ],
  exports: [
    FlexLayoutComponent,
    GridLayoutComponent,
    GridlessLayoutComponent,
    SplitLayoutComponent,
    LayoutFormComponent,
    LayoutDialogComponent,
    GridlessLayoutEditorComponent,
    GridlessLayoutRendererComponent,
    SplitLayoutEditorComponent,
    FlexLayoutRendererComponent,
    GridLayoutEditorComponent
  ]
})
export class LayoutModule {
  constructor(lpm: LayoutPluginManager) {
    [splitLayoutFactory(), gridlessLayoutFactory()].forEach(p => {
      lpm.register(p);
    });
  }
}
