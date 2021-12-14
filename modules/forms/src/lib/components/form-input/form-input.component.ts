import { Component } from "@angular/core";
import { ControlContainer } from "@angular/forms";
import { AttributeSerializerService } from 'attributes';
import { FormElementBase } from "../form-element-base/form-element-base.directive";
import { OptionsResolverService } from '../../services/options-resolver.services';

@Component({
  selector: 'druid-forms-form-input',
  styleUrls: ['./form-input.component.scss'],
  templateUrl: './form-input.component.html'
})
export class FormInputComponent extends FormElementBase {

  constructor(
    attributeSerializer: AttributeSerializerService,
    optionsResolverService: OptionsResolverService,
    controlContainer?: ControlContainer
  ) {
    super(attributeSerializer, optionsResolverService, controlContainer);
  }

}