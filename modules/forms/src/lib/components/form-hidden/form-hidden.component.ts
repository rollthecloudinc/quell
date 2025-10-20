import { Component } from "@angular/core";
import { ControlContainer } from "@angular/forms";
import { AttributeSerializerService } from '@rollthecloudinc/attributes';
import { ValidationPluginManager } from '@rollthecloudinc/ordain';
import { TokenizerService } from "@rollthecloudinc/token";
import { FormElementBase } from "../../directives/form-element-base.directive";
import { OptionsResolverService } from '../../services/options-resolver.services';
import { FormsContextHelperService } from "../../services/forms-context-helper.service";

@Component({
    selector: 'druid-forms-form-hidden',
    template: '',
    standalone: false
})
export class FormHiddenComponent extends FormElementBase {

  constructor(
    attributeSerializer: AttributeSerializerService,
    optionsResolverService: OptionsResolverService,
    tokenizerService: TokenizerService,
    formsContextHelper: FormsContextHelperService,
    vpm: ValidationPluginManager,
    controlContainer?: ControlContainer
  ) {
    super(attributeSerializer, optionsResolverService, tokenizerService, formsContextHelper, vpm, controlContainer);
  }

}