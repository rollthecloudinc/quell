import { CdkDragDrop } from "@angular/cdk/drag-drop"
import { FormArray } from "@angular/forms"
import { AttributeValue } from '@ng-druid/attributes'
import { RuleSet } from 'angular2-query-builder';
import { InlineContext } from '@ng-druid/context';
import { PersistenceFormPayload } from "@ng-druid/refinery";

// Editor behaviors
export interface PanelsEditor {

  onPropertiesClick(): void;
  onDeleteClick(): void;
  onRulesClick(): void;
  // onPropsClick(): void;
  addContent(index: number): void;
  editPanelProps(panelIndex: number): void;
  editPaneProps(panelIndex: number, paneIndex: number): void;
  hasPanelStyle(index: number): boolean;
  applyStyle(index: number): void;
  removeStyle(index: number): void
  panelStyleTitle(index): void;
  onFileChange(event: any, index: number): void;
  onDrop(evt: CdkDragDrop<string[]>): void;
  panelPanes(index: number): FormArray;
  onDeletePane(index: number, index2: number): void;
  onRulesPane(index: number, index2: number): void;
  onNestedUpdate(panelPage: PanelPage, index: number, index2: number): void;
  onOverrideRenderer(index: number, index2: number): void;
  onRemoveOverrideRenderer(index: number, index2: number): void;
  onPaneEdit(index: number, index2: number): void;
  onPaneDelete(index: number, index2: number): void;
  panelPaneName(index: number, index2: number): string;
  panelPaneLabel(index: number, index2: number): string;
  panelPaneLocked(index: number, index2: number): boolean;
  panelPanePlugin(index: number, index2: number): string;
  panelPaneSettings(index: number, index2: number): Array<AttributeValue>;
  onItemAdded(): void;
  onItemRemoved(index: number): void;
  onLayoutSettingChange(evt: LayoutSetting): void;
  onRowSettingsChange(evt: Array<LayoutSetting>): void
  onColumnSettingsChange(evt: Array<LayoutSetting>): void;
  submit(): void;
  onPersistenceClick(): void;

}

export class PanelsSettings {
  openSearchDomain: string;
  s3Bucket: string;
  constructor(data?: PanelsSettings) {
    if(data) {
      this.openSearchDomain = data.openSearchDomain;
      this.s3Bucket = data.s3Bucket;
    }
  }
}

export class PanelPage {
  id: string;
  name?: string;
  title?: string;
  path?: string;
  userId?: string;
  site?: string; // for but will required - accom old data
  layoutType: string;
  displayType: string;
  gridItems: Array<GridItem> = [];
  panels: Array<Panel> = [];
  contexts?: Array<InlineContext> = [];
  layoutSetting: LayoutSetting;
  rowSettings: Array<LayoutSetting> = [];
  entityPermissions?: PanelPagePermissions = new PanelPagePermissions();
  cssFile?: string;
  persistence?: PersistenceFormPayload;
  constructor(data?: PanelPage) {
    if(data) {
      this.id = data.id;
      this.layoutType = data.layoutType;
      this.displayType = data.displayType;
      this.name = data.name ? data.name : undefined;
      this.title = data.title ? data.title: undefined;
      this.site = data.site ? data.site : undefined;
      this.userId = data.userId ? data.userId : undefined;
      this.path = data.path ? data.path : undefined;
      this.persistence = data.persistence ? new PersistenceFormPayload(data.persistence) : undefined;
      if(data.panels) {
        this.panels = data.panels.map(p => new Panel(p));
      }
      if(data.gridItems) {
        this.gridItems = data.gridItems.map(i => new GridItem(i));
      }
      if(data.contexts) {
        this.contexts = data.contexts.map(c => new InlineContext(c));
      }
      if(data.layoutSetting) {
        this.layoutSetting = new LayoutSetting(data.layoutSetting);
      }
      if (data.rowSettings && Array.isArray(data.rowSettings)) {
        this.rowSettings = data.rowSettings.map(s => new LayoutSetting(s));
      }
      if (data.entityPermissions) {
        this.entityPermissions = new PanelPagePermissions(data.entityPermissions);
      }
      if (data.cssFile) {
        this.cssFile = data.cssFile;
      }
    }
  }
}

export class PanelPageListItem extends PanelPage {
}

export class GridLayout {
  id: string;
  site: string;
  gridItems: Array<GridItem> = [];
  constructor(data?: GridLayout) {
    if(data) {
      this.id = data.id;
      this.site = data.site;
      if(data.gridItems) {
        this.gridItems = data.gridItems.map(i => new GridItem(i));
      }
    }
  }
}

export class Panel {
  name?: string;
  label?: string;
  stylePlugin: string;
  settings: Array<AttributeValue> = [];
  panes: Array<Pane> = [];
  columnSetting: LayoutSetting;
  constructor(data?: Panel) {
    if(data) {
      this.name = data.name ? data.name : undefined;
      this.label = data.label ? data.label: undefined;
      this.stylePlugin = data.stylePlugin;
      if(data.settings) {
        this.settings = data.settings.map(a => new AttributeValue(a));
      }
      if(data.panes) {
        this.panes = data.panes.map(p => new Pane(p));
      }
      if (data.columnSetting) {
        this.columnSetting = new LayoutSetting(data.columnSetting);
      }
    }
  }
}

export class Pane {
  contentPlugin: string;
  name: string;
  label: string;
  settings: Array<AttributeValue> = [];
  locked? = false;
  linkedPageId?: string;
  metadata?: Map<string, any>;
  contexts?: Array<InlineContext> = [];
  rule?: RuleSet;
  nestedPage?: PanelPage;
  resolvedContext?: any;
  constructor(data?: Pane) {
    if(data) {
      this.name = data.name;
      this.label = data.label;
      this.contentPlugin = data.contentPlugin;
      this.locked = data.locked !== undefined ? data.locked : false;
      if(data.linkedPageId) {
        this.linkedPageId = data.linkedPageId;
      }
      if(data.metadata !== undefined) {
        this.metadata = new Map([ ...data.metadata ]);
      }
      if(data.settings !== undefined) {
        this.settings = data.settings.map(a => new AttributeValue(a));
      }
      if(data.contexts !== undefined) {
        this.contexts = data.contexts.map(c => new InlineContext(c));
      }
      if(data.rule !== undefined && typeof(data.rule) !== 'string') {
        this.rule = { ...data.rule } as RuleSet;
      }
      if (data.nestedPage) {
        this.nestedPage = new PanelPage(data.nestedPage);
      }
      if (data.resolvedContext) {
        this.resolvedContext = { ...data.resolvedContext };
      }
    }
  }
}

export class GridItem {
  cols: number;
  rows: number;
  x: number;
  y: number;
  weight: number;
  constructor(data?: GridItem) {
    if(data) {
      this.cols = data.cols;
      this.rows = data.rows;
      this.x = data.x;
      this.y = data.y;
      this.weight = data.weight;
    }
  }
}

export class LayoutSetting {
  settings: Array<AttributeValue> = []
  constructor(data?: LayoutSetting) {
    if (data) {
      if (data.settings && Array.isArray(data.settings)) {
        this.settings = data.settings.map(v => new AttributeValue(v));
      }
    }
  }
}

export class PanelPagePermissions {
	readUserIds: Array<string> = [];
	writeUserIds: Array<string> = [];
	deleteUserIds: Array<string> = [];
  constructor(data?: PanelPagePermissions) {
    if(data) {
      this.readUserIds = data.readUserIds ? data.readUserIds.map(id => id) : [];
      this.writeUserIds = data.writeUserIds ? data.writeUserIds.map(id => id) : [];
      this.deleteUserIds = data.deleteUserIds ? data.deleteUserIds.map(id => id) : [];
    }
  }
}

/*<classifieds-ui-gridless-layout cdkDropListGroup>
    <ng-template #extraActions>
      <button *ngIf="savable" type="submit">Save</button>
      <button *ngIf="savable" type="button" (click)="onPropertiesClick()">Properties</button>
      <ng-container *ngIf="savable"><ng-container *ngTemplateOutlet="contextsMenuTpl"></ng-container></ng-container>
      <button *ngIf="nested" type="button" (click)="onDeleteClick()">Delete</button>
      <button *ngIf="nested" type="button" (click)="onRulesClick()">Rules</button>
      <button type="button" (mousedown)="addContent(0)" (touchstart)="addContent(0)">Add Content</button>
      <button type="button" (mousedown)="editPanelProps(0)" (touchstart)="editPanelProps(0)" >Props</button>
      <span *ngIf="hasPanelStyle(0)">Style: {{ panelStyleTitle(0) }}</span>
      <button *ngIf="!hasPanelStyle(0)" type="button" (mousedown)="applyStyle(0)" (touchstart)="applyStyle(0)">Apply Style</button>
      <div class="layout-type">
        <mat-form-field>
          <mat-select required [formControl]="layoutType">
            <mat-option value="grid">Grid</mat-option>
            <mat-option value="gridless">Gridless</mat-option>
            <mat-option value="split">Split</mat-option>
          </mat-select>
        </mat-form-field>
      </div>
      <ng-container *ngTemplateOutlet="extraActionsAreaTmpl"></ng-container>
    </ng-template>
    <ng-template #gridItemActions let-i="i"></ng-template>
    <ng-template #innerGridItem let-i="i">
      <ngx-dropzone [cdkDropListData]="i" class="panel-dropzone" [multiple]="true" [disableClick]="true" (change)="onFileChange($event, i)" cdkDropList (cdkDropListDropped)="onDrop($event)">
        <div #panes>
          <classifieds-ui-editable-pane *ngFor="let pane of panelPanes(i).controls; let j = index" class="editable-pane" (delete)="onDeletePane(i, j)" (rules)="onRulesPane(i, j)" (nestedUpdate)="onNestedUpdate($event, i, j)" (rendererOverride)="onOverrideRenderer(i, j)" (removeRendererOverride)="onRemoveOverrideRenderer(i, j)" (edit)="onPaneEdit(i, j)" (delete)="onPaneDelete(i, j)" [panelIndex]="i" [paneIndex]="j" [name]="panelPaneName(i, j)" [label]="panelPaneLabel(i, j)" [locked]="panelPaneLocked(i, j)" [contexts]="contexts" [pluginName]="panelPanePlugin(i, j)" [settings]="panelPaneSettings(i, j)" cdkDrag>
            <div class="custom-placeholder" *cdkDragPlaceholder></div>
          </classifieds-ui-editable-pane>
        </div>
      </ngx-dropzone>
    </ng-template>
  </classifieds-ui-gridless-layout>*/