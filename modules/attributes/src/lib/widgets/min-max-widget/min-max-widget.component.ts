import { Component, Input } from '@angular/core';
import { ControlContainer } from "@angular/forms";
import { Attribute } from '../../models/attributes.models';

@Component({
  selector: 'classifieds-ui-min-max-widget',
  templateUrl: './min-max-widget.component.html',
  styleUrls: ['./min-max-widget.component.scss']
})
export class MinMaxWidgetComponent {

  @Input()
  attribute: Attribute;

  constructor(public controlContainer: ControlContainer) { }

}
