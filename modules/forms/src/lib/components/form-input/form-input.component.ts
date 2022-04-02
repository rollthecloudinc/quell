import { Component } from "@angular/core";
import { ControlContainer } from "@angular/forms";
import { AttributeSerializerService } from '@ng-druid/attributes';
import { TokenizerService } from "@ng-druid/token";
import { FormElementBase } from "../../directives/form-element-base.directive";
import { OptionsResolverService } from '../../services/options-resolver.services';
import { FormsContextHelperService } from "../../services/forms-context-helper.service";

@Component({
  selector: 'druid-forms-form-input',
  styleUrls: ['./form-input.component.scss'],
  templateUrl: './form-input.component.html'
})
export class FormInputComponent extends FormElementBase {

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