import { Component } from "@angular/core";
import { ControlContainer } from "@angular/forms";
import { AttributeSerializerService } from 'attributes';
import { FormElementBase } from "../form-element-base/form-element-base.component";

@Component({
  selector: 'druid-forms-form-textarea',
  styleUrls: ['./form-textarea.component.scss'],
  templateUrl: './form-textarea.component.html'
})
export class FormTextareaComponent extends FormElementBase {

  cols = 20;
  rows = 20;

  constructor(
    attributeSerializer: AttributeSerializerService,
    controlContainer?: ControlContainer
  ) {
    super(attributeSerializer, controlContainer);
  }

}