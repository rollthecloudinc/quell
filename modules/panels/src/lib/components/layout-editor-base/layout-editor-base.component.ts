import { Input, TemplateRef, Component } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { PanelsEditor, LayoutSetting, GridItem } from '../../models/panels.models';

@Component({
  selector: 'classifieds-ui-layout-editor-base',
  template: ''
})
export class LayoutEditorBaseComponent {

  @Input()
  savable = true;

  @Input()
  nested = false;

  @Input()
  editor: PanelsEditor;

  @Input()
  dashboard = [];

  @Input()
  layoutSetting = new LayoutSetting();

  @Input()
  rowSettings: Array<LayoutSetting> = [];

  @Input()
  columnSettings: Array<LayoutSetting>;

  @Input()
  editablePaneTpl: TemplateRef<any>;

  @Input()
  extraActionsAreaTmpl: TemplateRef<any>;

  @Input()
  contextsMenuTpl: TemplateRef<any>;

  get gridItems(): Array<GridItem> {
    return [];
  }

  constructor(public controlContainer: ControlContainer) { }

}