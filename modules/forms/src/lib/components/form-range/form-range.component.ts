import { Component } from "@angular/core";
import { ControlContainer, FormControl, FormGroup } from "@angular/forms";
import { TokenizerService } from "@rollthecloudinc/token";
import { AttributeSerializerService } from '@rollthecloudinc/attributes';
import { ValidationPluginManager } from '@rollthecloudinc/ordain';
import { OptionsResolverService } from "../../services/options-resolver.services";
import { FormElementBase } from "../../directives/form-element-base.directive";
import { FormsContextHelperService } from "../../services/forms-context-helper.service";
import { BehaviorSubject, debounceTime, tap } from "rxjs";

@Component({
    selector: 'druid-forms-form-range',
    styleUrls: ['./form-range.component.scss'],
    templateUrl: './form-range.component.html',
    standalone: false
})
export class FormRangeComponent extends FormElementBase {

  readonly rangeForm = new FormGroup({
    startValue: new FormControl(undefined), // Initial start value
    endValue: new FormControl(undefined)   // Initial end value
  });

  readonly min$ = new BehaviorSubject<number>(undefined);
  readonly max$ = new BehaviorSubject<number>(undefined);
  readonly step$ = new BehaviorSubject<number>(undefined);

  readonly rangeFormChangeSub = this.rangeForm.valueChanges.pipe(
    debounceTime(2000),
    tap(v => {
      // console.log('range form value changes', v);
      this.formControl.patchValue(v);
    })
  ).subscribe();

  readonly rangeSettingsSub = this.formSettings$.pipe(
    tap(fs => {
        // console.log('form range settings', fs);
        if (fs.min) {
            this.min$.next(parseInt(`${fs.min}`));
        }
        if (fs.max) {
            this.max$.next(parseInt(`${fs.max}`));
        }      
        if (fs.step) {
            this.step$.next(parseInt(`${fs.step}`));
        }
    })
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
  }

}