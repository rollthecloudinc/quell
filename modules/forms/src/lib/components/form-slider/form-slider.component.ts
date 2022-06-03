import { Component } from "@angular/core";
import { ControlContainer } from "@angular/forms";
import { TokenizerService } from "@rollthecloudinc/token";
import { AttributeSerializerService } from '@rollthecloudinc/attributes';
import { OptionsResolverService } from "../../services/options-resolver.services";
import { FormElementBase } from "../../directives/form-element-base.directive";
import { FormsContextHelperService } from "../../services/forms-context-helper.service";

@Component({
  selector: 'druid-forms-form-slider',
  styleUrls: ['./form-slider.component.scss'],
  templateUrl: './form-slider.component.html'
})
export class FormSliderComponent extends FormElementBase {

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