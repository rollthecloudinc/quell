import { Component, OnInit, Input, TemplateRef } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { LayoutEditorBaseComponent } from '@ng-druid/panels';

@Component({
  selector: 'classifieds-ui-gridless-layout-editor',
  templateUrl: './gridless-layout-editor.component.html',
  styleUrls: ['./gridless-layout-editor.component.scss']
})
export class GridlessLayoutEditorComponent extends LayoutEditorBaseComponent implements OnInit {

  constructor(public controlContainer: ControlContainer) { 
    super(controlContainer);
  }

  ngOnInit(): void {
  }

}