import { Component, OnInit, Inject, ComponentFactoryResolver, ViewChild, ElementRef, inject, Injector } from '@angular/core';
import { UntypedFormGroup, UntypedFormArray, UntypedFormBuilder } from '@angular/forms';
import { CONTENT_PLUGIN, ContentPlugin, ContentPluginManager } from '@rollthecloudinc/content';
import { InlineContext } from '@rollthecloudinc/context';
import { Subject, Observable } from 'rxjs';
import { ContentSelectionHostDirective } from '../../directives/content-selection-host.directive';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { RegisterRole } from '@rollthecloudinc/utils';
import { ContentSelector } from '../../models/role.models';

@Component({
    selector: 'classifieds-ui-content-selector',
    templateUrl: './content-selector.component.html',
    styleUrls: ['./content-selector.component.scss'],
    standalone: false
})
@RegisterRole('content_selector')
export class ContentSelectorComponent implements OnInit, ContentSelector {

  public injector = inject<Injector>(Injector);

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
    private contentPluginManager: ContentPluginManager,
    private host: ElementRef
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

  scrollTo(cls: string) {
    const container = (this.bottomSheetRef.containerInstance as any)?._elementRef?.nativeElement;

    if (!container) {
      console.warn('No container found');
      return;
    }

    // Inside that container: bottom sheet content
    /*const scrollContainer = container.querySelector('.mat-bottom-sheet-container');

    if (!scrollContainer) {
      console.warn('No .mat-bottom-sheet-container found');
      return;
    }*/

    const target = container.querySelector('.' + cls);

    if (!target) {
      console.warn('Target not found:', cls);
      return;
    }

    container.scroll({
      top: target.offsetTop - 50,
      behavior: 'smooth'
    });
  }

}
