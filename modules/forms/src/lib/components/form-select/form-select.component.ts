import { Component } from "@angular/core";
import { ControlContainer } from "@angular/forms";
import { AttributeSerializerService } from 'attributes';
import { OptionsResolverService } from "../../services/options-resolver.services";
import { FormElementBase } from "../form-element-base/form-element-base.directive";

@Component({
  selector: 'druid-forms-form-select',
  styleUrls: ['./form-select.component.scss'],
  templateUrl: './form-select.component.html'
})
export class FormSelectComponent extends FormElementBase {

  constructor(
    attributeSerializer: AttributeSerializerService,
    optionsResolverService: OptionsResolverService,
    controlContainer?: ControlContainer
  ) {
    super(attributeSerializer, optionsResolverService, controlContainer);
  }

}