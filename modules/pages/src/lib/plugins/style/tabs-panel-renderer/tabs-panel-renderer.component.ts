import { Component, OnInit, Input } from '@angular/core';
import { AttributeSerializerService, AttributeTypes, AttributeValue } from 'attributes';
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

  labelMappingsEnabled = false;

  constructor(
    private attributeSerializer: AttributeSerializerService
  ) { }

  ngOnInit(): void {
    const obj = this.attributeSerializer.deserialize(new AttributeValue({ name: '', displayName: '', computedValue: '', type: AttributeTypes.Complex, value: '', intValue: 0, attributes: this.settings }));
    this.labelMappingsEnabled = obj.labels !== undefined && Array.isArray(obj.labels) && obj.labels.length > 0 ? true : false;
  }

}
