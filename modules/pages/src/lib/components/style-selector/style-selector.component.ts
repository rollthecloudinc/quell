import { Component, OnInit, Inject, ComponentFactoryResolver, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormArray, UntypedFormBuilder } from '@angular/forms';
import { StylePlugin, StylePluginManager } from '@rollthecloudinc/panels';
import { Observable, Subject } from 'rxjs';
import { ContentSelectionHostDirective } from '../../directives/content-selection-host.directive';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { InlineContext } from '@rollthecloudinc/context';

@Component({
    selector: 'classifieds-ui-style-selector',
    templateUrl: './style-selector.component.html',
    styleUrls: ['./style-selector.component.scss'],
    standalone: false
})
export class StyleSelectorComponent implements OnInit {

  selectedIndex = 0
  plugin: StylePlugin<string>;

  stylePlugins: Observable<Map<string, StylePlugin<string>>>;

  @ViewChild(ContentSelectionHostDirective, {static: true}) selectionHost: ContentSelectionHostDirective;

  constructor(
    // @Inject(STYLE_PLUGIN) stylePlugins: Array<StylePlugin>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: { panelForm:UntypedFormGroup, panelIndex: number, contexts: Array<InlineContext>, contentAdded: Subject<[number, number]> },
    private spm: StylePluginManager,
    private bottomSheetRef: MatBottomSheetRef<StyleSelectorComponent>,
    private dialog: MatDialog,
    private componentFactoryResolver: ComponentFactoryResolver,
    private fb: UntypedFormBuilder
  ) {
    // this.stylePlugins = stylePlugins;
  }

  ngOnInit() {
    this.stylePlugins = this.spm.getPlugins();
  }

  onStyleSelected(plugin: StylePlugin<string>) {
    this.plugin = plugin;
    if(this.plugin.editorComponent !== undefined) {
      this.bottomSheetRef.dismiss();
      this.data.panelForm.get('stylePlugin').setValue(this.plugin.name);
      this.data.panelForm.get('styleTitle').setValue(this.plugin.title);
      (this.data.panelForm.get('settings') as UntypedFormArray).clear();
      const dialogRef = this.dialog.open(this.plugin.editorComponent, { data: { panelFormGroup: this.data.panelForm, panelIndex: this.data.panelIndex, contexts: this.data.contexts } });
    } else {
      this.data.panelForm.get('stylePlugin').setValue(this.plugin.name);
      this.data.panelForm.get('styleTitle').setValue(this.plugin.title);
      (this.data.panelForm.get('settings') as UntypedFormArray).clear();
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
