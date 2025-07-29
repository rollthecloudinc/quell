import { Component, OnInit, Inject, ComponentFactoryResolver, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormArray, UntypedFormBuilder } from '@angular/forms';
import { CONTENT_PLUGIN, ContentPlugin, ContentPluginManager } from '@rollthecloudinc/content';
import { InlineContext } from '@rollthecloudinc/context';
import { Subject, Observable } from 'rxjs';
import { ContentSelectionHostDirective } from '../../directives/content-selection-host.directive';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'classifieds-ui-content-selector',
  templateUrl: './content-selector.component.html',
  styleUrls: ['./content-selector.component.scss']
})
export class ContentSelectorComponent implements OnInit {

  selectedIndex = 0
  plugin: ContentPlugin;

  // contentPlugins: Array<ContentPlugin> = [];
  contentPlugins: Observable<Map<string, ContentPlugin<string>>>;

  @ViewChild(ContentSelectionHostDirective, {static: true}) selectionHost: ContentSelectionHostDirective;

  constructor(
    // @Inject(CONTENT_PLUGIN) contentPlugins: Array<ContentPlugin>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: { panelForm:UntypedFormGroup, panelIndex: number, contexts: Array<InlineContext>, contentAdded: Subject<[number, number]> },
    private bottomSheetRef: MatBottomSheetRef<ContentSelectorComponent>,
    private dialog: MatDialog,
    private componentFactoryResolver: ComponentFactoryResolver,
    private fb: UntypedFormBuilder,
    private contentPluginManager: ContentPluginManager
  ) {
    // this.contentPlugins = contentPlugins;
  }

  ngOnInit(): void {
    this.contentPlugins = this.contentPluginManager.getPlugins();
  }

  onEntitySelected(plugin: ContentPlugin) {
    this.plugin = plugin;
    if(this.plugin.selectionComponent !== undefined) {
      this.selectedIndex = 1;
      this.renderSelectionComponent();
    } else if(this.plugin.editorComponent !== undefined) {
      this.bottomSheetRef.dismiss();
      if (plugin.handler) {
        this.plugin.handler.editorOptions([]).subscribe(o => {
          const dialogRef = this.dialog.open(
            this.plugin.editorComponent, 
            { data: { panelFormGroup: this.data.panelForm, panelIndex: this.data.panelIndex, pane: undefined, paneIndex: undefined, contexts: this.data.contexts, contentAdded: this.data.contentAdded, plugin },
            ...(o.fullscreen ? { maxWidth: '100vw', maxHeight: '100vh', height: '100%', width: '100%' } : {})
          });
        });
      } else {
        const dialogRef = this.dialog.open(this.plugin.editorComponent, { data: { panelFormGroup: this.data.panelForm, panelIndex: this.data.panelIndex, pane: undefined, paneIndex: undefined, contexts: this.data.contexts, contentAdded: this.data.contentAdded } });
      }
    } else {
      (this.data.panelForm.get('panes') as UntypedFormArray).push(this.fb.group({
        contentPlugin: this.fb.control(this.plugin.id),
        name: this.fb.control(''),
        label: this.fb.control(''),
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
    (componentRef.instance as any).contexts = this.data.contexts;

  }

}
