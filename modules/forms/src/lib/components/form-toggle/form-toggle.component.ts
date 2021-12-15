import { Component } from "@angular/core";
import { ControlContainer } from "@angular/forms";
import { AttributeSerializerService } from 'attributes';
import { OptionsResolverService } from "../../services/options-resolver.services";
import { FormElementBase } from "../../directives/form-element-base.directive";

@Component({
  selector: 'druid-forms-form-toggle',
  styleUrls: ['./form-toggle.component.scss'],
  templateUrl: './form-toggle.component.html'
})
export class FormToggleComponent extends FormElementBase {

  constructor(
    attributeSerializer: AttributeSerializerService,
    optionsResolverService: OptionsResolverService,
    controlContainer?: ControlContainer
  ) {
    super(attributeSerializer, optionsResolverService, controlContainer);
  }

}