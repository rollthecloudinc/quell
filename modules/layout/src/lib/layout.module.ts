import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularSplitModule } from 'angular-split';
import { MaterialModule } from 'material';
import { GridsterModule } from 'angular-gridster2';
import { AttributesModule } from 'attributes';
import { TokenModule } from 'token';
import { UtilsModule } from 'utils';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { FlexLayoutComponent } from './components/flex-layout/flex-layout.component';
import { GridLayoutComponent } from './components/grid-layout/grid-layout.component';
import { GridlessLayoutComponent } from './components/gridless-layout/gridless-layout.component';
import { SplitLayoutComponent } from './components/split-layout/split-layout.component';
import { LayoutFormComponent } from './components/layout-form/layout-form.component';
import { LayoutDialogComponent } from './components/layout-dialog/layout-dialog.component';
import { LayoutPluginManager } from './services/layout-plugin-manager.service';
import { splitLayoutFactory, gridLayoutFactory, gridlessLayoutFactory } from './layout.factories';
import { GridlessLayoutEditorComponent } from './components/gridless-layout-editor/gridless-layout-editor.component';
import { GridlessLayoutRendererComponent } from './components/gridless-layout-renderer/gridless-layout-renderer.component';

@NgModule({
  declarations: [
    FlexLayoutComponent,
    GridLayoutComponent,
    GridlessLayoutComponent,
    SplitLayoutComponent,
    LayoutFormComponent,
    LayoutDialogComponent,
    GridlessLayoutEditorComponent,
    GridlessLayoutRendererComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    FlexLayoutModule,
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
    GridlessLayoutRendererComponent
  ]
})
export class LayoutModule {
  constructor(lpm: LayoutPluginManager) {
    [splitLayoutFactory(), gridLayoutFactory(), gridlessLayoutFactory()].forEach(p => {
      lpm.register(p);
    });
  }
}
