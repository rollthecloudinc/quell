import { Component } from "@angular/core";
import { ControlContainer } from "@angular/forms";
import { AttributeSerializerService } from 'attributes';
import { FormElementBase } from "../form-element-base/form-element-base.component";

@Component({
  selector: 'druid-forms-form-select',
  styleUrls: ['./form-select.component.scss'],
  templateUrl: './form-select.component.html'
})
export class FormSelectComponent extends FormElementBase {

  constructor(
    attributeSerializer: AttributeSerializerService,
    controlContainer?: ControlContainer
  ) {
    super(attributeSerializer, controlContainer);
  }

}