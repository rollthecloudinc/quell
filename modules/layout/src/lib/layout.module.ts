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
import { FlexLayoutComponent } from './components/flex-layout/flex-layout.component';
import { GridLayoutComponent } from './components/grid-layout/grid-layout.component';
import { GridlessLayoutComponent } from './components/gridless-layout/gridless-layout.component';
import { SplitLayoutComponent } from './components/split-layout/split-layout.component';
import { LayoutDialogComponent } from './components/layout-dialog/layout-dialog.component';
import { LayoutFormComponent } from './components/layout-form/layout-form.component';

@NgModule({
  declarations: [
    FlexLayoutComponent,
    GridLayoutComponent,
    GridlessLayoutComponent,
    SplitLayoutComponent,
    LayoutDialogComponent,
    LayoutFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    FlexLayoutModule,
    AngularSplitModule,
    GridsterModule,
    UtilsModule,
    TokenModule,
    AttributesModule,
  ],
  exports: [
    FlexLayoutComponent,
    GridLayoutComponent,
    GridlessLayoutComponent,
    SplitLayoutComponent,
    LayoutDialogComponent,
    LayoutFormComponent
  ]
})
export class LayoutModule { }
