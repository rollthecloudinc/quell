import { Component } from "@angular/core";
import { ControlContainer } from "@angular/forms";
import { AttributeSerializerService } from 'attributes';
import { FormElementBase } from "../form-element-base/form-element-base.component";

@Component({
  selector: 'druid-forms-form-input',
  styleUrls: ['./form-input.component.scss'],
  templateUrl: './form-input.component.html'
})
export class FormInputComponent extends FormElementBase {

  constructor(
    attributeSerializer: AttributeSerializerService,
    controlContainer?: ControlContainer
  ) {
    super(attributeSerializer, controlContainer);
  }

}