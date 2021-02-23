import { Component, OnInit, Input, TemplateRef } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { PanelsEditor } from 'panels';

@Component({
  selector: 'classifieds-ui-gridless-layout-editor',
  templateUrl: './gridless-layout-editor.component.html',
  styleUrls: ['./gridless-layout-editor.component.scss']
})
export class GridlessLayoutEditorComponent implements OnInit {

  @Input()
  savable = true;

  @Input()
  nested = false;

  @Input()
  editor: PanelsEditor;

  @Input()
  editablePaneTpl: TemplateRef<any>;

  @Input()
  extraActionsAreaTmpl: TemplateRef<any>;

  @Input()
  contextsMenuTpl: TemplateRef<any>;

  constructor(public controlContainer: ControlContainer) { }

  ngOnInit(): void {
  }

}