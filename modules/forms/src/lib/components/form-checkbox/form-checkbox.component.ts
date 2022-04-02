import { Component } from "@angular/core";
import { ControlContainer } from "@angular/forms";
import { AttributeSerializerService } from '@ng-druid/attributes';
import { OptionsResolverService } from "../../services/options-resolver.services";
import { FormElementBase } from "../../directives/form-element-base.directive";
import { TokenizerService } from "@ng-druid/token";
import { FormsContextHelperService } from "../../services/forms-context-helper.service";

@Component({
  selector: 'druid-forms-form-checkbox',
  styleUrls: ['./form-checkbox.component.scss'],
  templateUrl: './form-checkbox.component.html'
})
export class FormCheckboxComponent extends FormElementBase {

  constructor(
    attributeSerializer: AttributeSerializerService,
    optionsResolverService: OptionsResolverService,
    tokenizerService: TokenizerService,
    formsContextHelper: FormsContextHelperService,
    controlContainer?: ControlContainer
  ) {
    super(attributeSerializer, optionsResolverService, tokenizerService, formsContextHelper, controlContainer);
  }

}