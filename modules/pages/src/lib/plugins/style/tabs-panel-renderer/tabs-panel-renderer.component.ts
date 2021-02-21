import { Component, OnInit, Input } from '@angular/core';
import { AttributeValue } from 'attributes';
import { Pane } from 'panels';

@Component({
  selector: 'classifieds-ui-tabs-panel-renderer',
  templateUrl: './tabs-panel-renderer.component.html',
  styleUrls: ['./tabs-panel-renderer.component.scss']
})
export class TabsPanelRendererComponent implements OnInit {

  @Input()
  settings: Array<AttributeValue> = [];

  @Input()
  panes: Array<Pane> = [];

  @Input()
  originPanes: Pane;

  @Input()
  originMappings: Array<number> = [];

  constructor() { }

  ngOnInit(): void {
  }

}
