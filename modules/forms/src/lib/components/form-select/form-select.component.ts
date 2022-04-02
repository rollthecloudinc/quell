import { Component } from "@angular/core";
import { ControlContainer } from "@angular/forms";
import { AttributeSerializerService } from '@ng-druid/attributes';
import { TokenizerService } from "@ng-druid/token";
import { OptionsResolverService } from "../../services/options-resolver.services";
import { FormElementBase } from "../../directives/form-element-base.directive";
import { FormsContextHelperService } from "../../services/forms-context-helper.service";

@Component({
  selector: 'druid-forms-form-select',
  styleUrls: ['./form-select.component.scss'],
  templateUrl: './form-select.component.html'
})
export class FormSelectComponent extends FormElementBase {

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