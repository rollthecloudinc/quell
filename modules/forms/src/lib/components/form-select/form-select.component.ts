import { Component } from "@angular/core";
import { ControlContainer } from "@angular/forms";
import { AttributeSerializerService } from '@rollthecloudinc/attributes';
import { ValidationPluginManager } from '@rollthecloudinc/ordain';
import { TokenizerService } from "@rollthecloudinc/token";
import { OptionsResolverService } from "../../services/options-resolver.services";
import { FormElementBase } from "../../directives/form-element-base.directive";
import { FormsContextHelperService } from "../../services/forms-context-helper.service";

@Component({
    selector: 'druid-forms-form-select',
    styleUrls: ['./form-select.component.scss'],
    templateUrl: './form-select.component.html',
    standalone: false
})
export class FormSelectComponent extends FormElementBase {

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