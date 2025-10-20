import { Component, OnInit, Input, Inject} from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, Validators, UntypedFormArray, UntypedFormGroup } from '@angular/forms';
import * as uuid from 'uuid';
import { AttributeValue } from '@rollthecloudinc/attributes';
import { SITE_NAME } from '@rollthecloudinc/utils';
import { PanelPage, PanelPageListItem, LayoutSetting } from '../../../models/panels.models';
import { EntityServices, EntityCollectionService } from '@ngrx/data';
import { PanelContentHandler } from '../../../handlers/panel-content.handler';
import { MatDialog } from '@angular/material/dialog';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { CONTENT_PLUGIN, ContentPlugin } from '@rollthecloudinc/content';
// import { ContentSelectorComponent } from '../../../components/content-selector/content-selector.component';
import { Observable } from 'rxjs';

@Component({
    selector: 'classifieds-ui-panel-selector',
    templateUrl: './panel-selector.component.html',
    styleUrls: ['./panel-selector.component.scss'],
    standalone: false
})
export class PanelSelectorComponent implements OnInit {

  @Input()
  panelFormGroup: UntypedFormGroup;

  selectedIndex: number = 0;

  panels$: Observable<Array<PanelPageListItem>>;

  panelPagesService: EntityCollectionService<PanelPage>;
  panelPageListItemsService: EntityCollectionService<PanelPageListItem>;

  // private contentPlugin: ContentPlugin;

  constructor(
    // @Inject(CONTENT_PLUGIN) contentPlugins: Array<ContentPlugin>,
    @Inject(SITE_NAME) private siteName: string,
    private bottomSheetRef: MatBottomSheetRef</*ContentSelectorComponent*/any>,
    private handler: PanelContentHandler,
    private dialog: MatDialog,
    private fb: UntypedFormBuilder,
    es: EntityServices
  ) {
    this.panelPagesService = es.getEntityCollectionService('PanelPage');
    this.panelPageListItemsService = es.getEntityCollectionService('PanelPageListItem');
    // this.contentPlugin = contentPlugins.find(p => p.name === 'panel');
  }

  ngOnInit(): void {
  }

  onNewSelect() {
    const name = uuid.v4();
    const newPanel = new PanelPage({ id: undefined, layoutType: 'split', displayType: 'page', site: this.siteName, gridItems: [], panels: [], layoutSetting: new LayoutSetting(), rowSettings: [] });
    (this.panelFormGroup.get('panes') as UntypedFormArray).push(this.fb.group({
      contentPlugin: 'panel',
      name: name,
      label: name,
      rule: new UntypedFormControl(''),
      settings: this.fb.array(this.handler.buildSettings(newPanel).map(s => this.convertToGroup(s)))
    }));
    this.bottomSheetRef.dismiss();
  }

  onLinkSelect() {
    this.selectedIndex = 1;
    this.panels$ = this.panelPageListItemsService.getWithQuery(`site=${encodeURIComponent(this.siteName)}`);
  }

  onEmbedSelect() {
    const name = uuid.v4();
    (this.panelFormGroup.get('panes') as UntypedFormArray).push(this.fb.group({
      contentPlugin: 'panel',
      name: name,
      label: name,
      rule: new UntypedFormControl(''),
      locked: new UntypedFormControl(true),
      settings: this.fb.array([])
    }));
    this.bottomSheetRef.dismiss();
  }

  onItemSelect(panel: string) {
    const name = uuid.v4();
    //this.panelPagesService.getByKey(panel).subscribe(p => {
      //this.dialog.open(this.contentPlugin.editorComponent, { data: { panelFormGroup: this.panelFormGroup, pane: undefined, paneIndex: undefined, panelPage: p } });
      (this.panelFormGroup.get('panes') as UntypedFormArray).push(this.fb.group({
        contentPlugin: 'panel',
        name: name,
        label: name,
        rule: new UntypedFormControl(''),
        linkedPageId: new UntypedFormControl(panel, Validators.required),
        locked: new UntypedFormControl(true),
        // settings: this.fb.array(this.handler.buildSettings(p).map(s => this.convertToGroup(s)))
        settings: this.fb.array([])
      }));
      this.bottomSheetRef.dismiss();
    //});
  }

  convertToGroup(setting: AttributeValue): UntypedFormGroup {

    const fg = this.fb.group({
      name: new UntypedFormControl(setting.name, Validators.required),
      type: new UntypedFormControl(setting.type, Validators.required),
      displayName: new UntypedFormControl(setting.displayName, Validators.required),
      value: new UntypedFormControl(setting.value, Validators.required),
      computedValue: new UntypedFormControl(setting.value, Validators.required),
      attributes: new UntypedFormArray([])
    });

    if(setting.attributes && setting.attributes.length > 0) {
      setting.attributes.forEach(s => {
        (fg.get('attributes') as UntypedFormArray).push(this.convertToGroup(s));
      })
    }

    return fg;

  }

}
