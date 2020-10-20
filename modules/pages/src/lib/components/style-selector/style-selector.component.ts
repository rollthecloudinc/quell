import { Component, OnInit, Inject, ComponentFactoryResolver, ViewChild } from '@angular/core';
import { FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { STYLE_PLUGIN, StylePlugin } from '@classifieds-ui/style';
import { ContentSelectionHostDirective } from '../../directives/content-selection-host.directive';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'classifieds-ui-style-selector',
  templateUrl: './style-selector.component.html',
  styleUrls: ['./style-selector.component.scss']
})
export class StyleSelectorComponent implements OnInit {

  selectedIndex = 0
  plugin: StylePlugin;

  stylePlugins: Array<StylePlugin> = [];

  @ViewChild(ContentSelectionHostDirective, {static: true}) selectionHost: ContentSelectionHostDirective;

  constructor(
    @Inject(STYLE_PLUGIN) stylePlugins: Array<StylePlugin>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public panelFormGroup: FormGroup,
    private bottomSheetRef: MatBottomSheetRef<StyleSelectorComponent>,
    private dialog: MatDialog,
    private componentFactoryResolver: ComponentFactoryResolver,
    private fb: FormBuilder
  ) {
    this.stylePlugins = stylePlugins;
  }

  ngOnInit() {

  }

  onStyleSelected(plugin: StylePlugin) {
    this.plugin = plugin;
    if(this.plugin.editorComponent !== undefined) {
      this.bottomSheetRef.dismiss();
      const dialogRef = this.dialog.open(this.plugin.editorComponent);
    } else {
      this.panelFormGroup.get('stylePlugin').setValue(this.plugin.name);
      (this.panelFormGroup.get('settings') as FormArray).clear();
      this.bottomSheetRef.dismiss();
    }
    /*if(this.plugin.selectionComponent !== undefined) {
      this.selectedIndex = 1;
      this.renderSelectionComponent();
    } else if(this.plugin.editorComponent !== undefined) {
      this.bottomSheetRef.dismiss();
      const dialogRef = this.dialog.open(this.plugin.editorComponent, { data: { panelFormGroup: this.panelFormGroup, pane: undefined, paneIndex: undefined } });
    } else {
      (this.panelFormGroup.get('panes') as FormArray).push(this.fb.group({
        contentProvider: this.plugin.name,
        settings: this.fb.array([])
      }));
    }*/
  }

}
