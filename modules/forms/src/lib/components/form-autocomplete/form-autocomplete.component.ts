import { Component } from "@angular/core";
import { ControlContainer, UntypedFormControl } from "@angular/forms";
import { AttributeSerializerService } from '@rollthecloudinc/attributes';
import { ValidationPluginManager } from '@rollthecloudinc/ordain';
import { OptionsResolverService } from "../../services/options-resolver.services";
import { FormElementBase } from "../../directives/form-element-base.directive";
import { debounceTime, distinctUntilChanged, map, switchMap, tap, withLatestFrom } from "rxjs/operators";
import { combineLatest, Subject } from "rxjs";
import { Mapping, Param } from '@rollthecloudinc/dparam';
import { MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
import { SelectOption } from '@rollthecloudinc/datasource';
import { TokenizerService } from "@rollthecloudinc/token";
import { FormsContextHelperService } from "../../services/forms-context-helper.service";
@Component({
  selector: 'druid-forms-form-autocomplete',
  styleUrls: ['./form-autocomplete.component.scss'],
  templateUrl: './form-autocomplete.component.html'
})
export class FormAutocompleteComponent extends FormElementBase {

  displayAuto: (opt: SelectOption) => string;

  readonly proxyControl = new UntypedFormControl('');
  readonly optionSelected$ = new Subject<MatAutocompleteSelectedEvent>();

  readonly proxyControlValueChangesSub = this.proxyControl.valueChanges.pipe(
    debounceTime(1000),
    distinctUntilChanged(),
    withLatestFrom(combineLatest([
      this.formSettings$,
      this.panes$,
      this.originPanes$,
      this.contexts$
    ]).pipe(
      map(([ settings, panes, originPanes, contexts ]) => ({ settings, panes, originPanes, contexts }))
    )),
    map(([term, { settings, panes, originPanes, contexts }]) => ({ term, settings, metadata: new Map<string, any>([ [ 'panes', [ ...(panes && Array.isArray(panes) ? panes : []), ...(originPanes && Array.isArray(originPanes) ? originPanes : []) ] ], [ 'contexts', contexts ], [ 'inputparams', new Map<string, Param>([ [ 'term', new Param({ flags: [], mapping: new Mapping({ value: term, testValue: term, type: 'static', context: undefined, }) }) ] ]) ] ]) })),
    switchMap(({ settings, metadata }) => this.optionsResolver.resolveElementOptions(settings, metadata)),
    tap(options => this.options$.next(options))
  ).subscribe();

  readonly optionSelectedSub = this.optionSelected$.pipe(
    tap(e => this.formControl.setValue(e.option && e.option.value ? e.option.value.value : ''))
  ).subscribe();

  constructor(
    attributeSerializer: AttributeSerializerService,
    optionsResolverService: OptionsResolverService,
    tokenizerService: TokenizerService,
    formsContextHelper: FormsContextHelperService,
    vpm: ValidationPluginManager,
    controlContainer?: ControlContainer
  ) {
    super(attributeSerializer, optionsResolverService, tokenizerService, formsContextHelper, vpm, controlContainer);
    this.displayAuto = (opt: SelectOption): string => {
      return opt.label;
      // return tokenizerService.replaceTokens(this.selectMapping.label, this.tokenizerService.generateGenericTokens(opt.dataItem));
    };
  }

}