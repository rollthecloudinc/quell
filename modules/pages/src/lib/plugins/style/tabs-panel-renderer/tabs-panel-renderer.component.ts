import { Component, OnInit, Input } from '@angular/core';
import { AttributeSerializerService, AttributeTypes, AttributeValue } from '@ng-druid/attributes';
import { Pane } from '@ng-druid/panels';

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
    console.log('tabs panels contexts');
    console.log(this.panes);
    const obj = this.attributeSerializer.deserialize(new AttributeValue({ name: '', displayName: '', computedValue: '', type: AttributeTypes.Complex, value: '', intValue: 0, attributes: this.settings }));
    this.labelMappingsEnabled = obj && obj.labels !== undefined && Array.isArray(obj.labels) && obj.labels.length > 0 ? true : false;
  }

}
