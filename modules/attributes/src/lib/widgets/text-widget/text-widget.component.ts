
import { Component, Input } from '@angular/core';
import { ControlContainer } from "@angular/forms";
import { Attribute } from '../../models/attributes.models';

@Component({
  selector: 'classifieds-ui-text-widget',
  templateUrl: './text-widget.component.html',
  styleUrls: ['./text-widget.component.scss']
})
export class TextWidgetComponent {

  @Input()
  attribute: Attribute;

  @Input()
  appearance = "legacy"

  constructor(public controlContainer: ControlContainer) { }

}
