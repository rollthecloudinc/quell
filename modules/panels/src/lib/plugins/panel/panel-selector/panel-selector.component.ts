import { Component, OnInit, Input, Inject} from '@angular/core';
import { FormBuilder, FormControl, Validators, FormArray, FormGroup } from '@angular/forms';
import * as uuid from 'uuid';
import { AttributeValue } from '@ng-druid/attributes';
import { SITE_NAME } from '@ng-druid/utils';
import { PanelPage, PanelPageListItem, LayoutSetting } from '../../../models/panels.models';
import { EntityServices, EntityCollectionService } from '@ngrx/data';
import { PanelContentHandler } from '../../../handlers/panel-content.handler';
import { MatDialog } from '@angular/material/dialog';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { CONTENT_PLUGIN, ContentPlugin } from '@ng-druid/content';
// import { ContentSelectorComponent } from '../../../components/content-selector/content-selector.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'classifieds-ui-panel-selector',
  templateUrl: './panel-selector.component.html',
  styleUrls: ['./panel-selector.component.scss']
})
export class PanelSelectorComponent implements OnInit {

  @Input()
  panelFormGroup: FormGroup;

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
    private fb: FormBuilder,
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
    const newPanel = new PanelPage({ id: undefined, layoutType: 'grid', displayType: 'page', site: this.siteName, gridItems: [], panels: [], layoutSetting: new LayoutSetting(), rowSettings: [] });
    (this.panelFormGroup.get('panes') as FormArray).push(this.fb.group({
      contentPlugin: 'panel',
      name: name,
      label: name,
      rule: new FormControl(''),
      settings: this.fb.array(this.handler.buildSettings(newPanel).map(s => this.convertToGroup(s)))
    }));
    this.bottomSheetRef.dismiss();
  }

  onLinkSelect() {
    this.selectedIndex = 1;
    this.panels$ = this.panelPageListItemsService.getWithQuery(`site=${encodeURIComponent(this.siteName)}`);
  }

  onItemSelect(panel: string) {
    const name = uuid.v4();
    //this.panelPagesService.getByKey(panel).subscribe(p => {
      //this.dialog.open(this.contentPlugin.editorComponent, { data: { panelFormGroup: this.panelFormGroup, pane: undefined, paneIndex: undefined, panelPage: p } });
      (this.panelFormGroup.get('panes') as FormArray).push(this.fb.group({
        contentPlugin: 'panel',
        name: name,
        label: name,
        rule: new FormControl(''),
        linkedPageId: new FormControl(panel, Validators.required),
        locked: new FormControl(true),
        // settings: this.fb.array(this.handler.buildSettings(p).map(s => this.convertToGroup(s)))
        settings: this.fb.array([])
      }));
      this.bottomSheetRef.dismiss();
    //});
  }

  convertToGroup(setting: AttributeValue): FormGroup {

    const fg = this.fb.group({
      name: new FormControl(setting.name, Validators.required),
      type: new FormControl(setting.type, Validators.required),
      displayName: new FormControl(setting.displayName, Validators.required),
      value: new FormControl(setting.value, Validators.required),
      computedValue: new FormControl(setting.value, Validators.required),
      attributes: new FormArray([])
    });

    if(setting.attributes && setting.attributes.length > 0) {
      setting.attributes.forEach(s => {
        (fg.get('attributes') as FormArray).push(this.convertToGroup(s));
      })
    }

    return fg;

  }

}
