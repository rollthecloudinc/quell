import { Component, OnInit, Inject, ComponentFactoryResolver, ViewChild } from '@angular/core';
import { FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { CONTENT_PLUGIN, ContentPlugin } from '@classifieds-ui/content';
import { Subject } from 'rxjs';
import { ContentSelectionHostDirective } from '../../directives/content-selection-host.directive';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { InlineContext } from '../../models/context.models';

@Component({
  selector: 'classifieds-ui-content-selector',
  templateUrl: './content-selector.component.html',
  styleUrls: ['./content-selector.component.scss']
})
export class ContentSelectorComponent implements OnInit {

  selectedIndex = 0
  plugin: ContentPlugin;

  contentPlugins: Array<ContentPlugin> = [];

  @ViewChild(ContentSelectionHostDirective, {static: true}) selectionHost: ContentSelectionHostDirective;

  constructor(
    @Inject(CONTENT_PLUGIN) contentPlugins: Array<ContentPlugin>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: { panelForm:FormGroup, panelIndex: number, contexts: Array<InlineContext>, contentAdded: Subject<[number, number]> },
    private bottomSheetRef: MatBottomSheetRef<ContentSelectorComponent>,
    private dialog: MatDialog,
    private componentFactoryResolver: ComponentFactoryResolver,
    private fb: FormBuilder
  ) {
    this.contentPlugins = contentPlugins;
  }

  ngOnInit(): void {
  }

  onEntitySelected(plugin: ContentPlugin) {
    this.plugin = plugin;
    if(this.plugin.selectionComponent !== undefined) {
      this.selectedIndex = 1;
      this.renderSelectionComponent();
    } else if(this.plugin.editorComponent !== undefined) {
      this.bottomSheetRef.dismiss();
      const dialogRef = this.dialog.open(this.plugin.editorComponent, { data: { panelFormGroup: this.data.panelForm, panelIndex: this.data.panelIndex, pane: undefined, paneIndex: undefined, contexts: this.data.contexts, contentAdded: this.data.contentAdded } });
    } else {
      (this.data.panelForm.get('panes') as FormArray).push(this.fb.group({
        contentProvider: this.plugin.name,
        settings: this.fb.array([])
      }));
    }
  }

  renderSelectionComponent() {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.plugin.selectionComponent);

    const viewContainerRef = this.selectionHost.viewContainerRef;
    viewContainerRef.clear();

    const componentRef = viewContainerRef.createComponent(componentFactory);
    (componentRef.instance as any).panelFormGroup = this.data.panelForm;
    (componentRef.instance as any).contents = this.data.contexts;

  }

}
